import { getDatabase } from '../db/initialize';
import { Permission, User, Role, Tenant, TenantPolicy, ElevationRequest, AuditLog } from '../types/access-control';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from './AuditService';
import { ComplianceService } from './ComplianceService';

export interface PermissionCheckRequest {
  user_id: string;
  tenant_id: string;
  permission_code: string;
  scope?: {
    type: 'region' | 'vendor' | 'technology' | 'cluster' | 'object_type';
    value: string;
  };
  context?: {
    ip_address?: string;
    user_agent?: string;
  };
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  denialReason?: string;
  checkPath?: string[]; // Shows which checks passed/failed
}

/**
 * Core permission evaluation service
 * Implements the three-layer security model:
 * Layer 1: Tenant access (is user a member of the tenant?)
 * Layer 2: Role permission (does user's role have the permission?)
 * Layer 3: Policy validation (do tenant policies allow this?)
 */
export class PermissionEvaluationService {
  private db = getDatabase();
  private auditService = new AuditService();
  private complianceService = new ComplianceService();

  /**
   * Main permission evaluation function
   * Returns true only if ALL three layers approve
   */
  evaluatePermission(req: PermissionCheckRequest): PermissionCheckResult {
    const checkPath: string[] = [];

    try {
      // Step 1: Check if user exists
      const user = this.getUserById(req.user_id);
      if (!user) {
        checkPath.push('USER_NOT_FOUND');
        return this.deny('User not found', checkPath);
      }

      // Step 2: Check tenant access (Layer 1)
      if (!this.userHasAccessToTenant(req.user_id, req.tenant_id)) {
        checkPath.push('TENANT_ACCESS_DENIED');
        this.logDeniedAction(req, 'USER_NOT_MEMBER_OF_TENANT', checkPath);
        return this.deny('User is not a member of this tenant', checkPath);
      }
      checkPath.push('TENANT_ACCESS_OK');

      // Step 3: Get user's role in this tenant
      const userRole = this.getUserRoleInTenant(req.user_id, req.tenant_id);
      if (!userRole) {
        checkPath.push('NO_ROLE_ASSIGNED');
        this.logDeniedAction(req, 'NO_ROLE_ASSIGNED', checkPath);
        return this.deny('User has no role assigned in this tenant', checkPath);
      }
      checkPath.push('ROLE_FOUND');

      // Step 4: Check role-based permission (Layer 2)
      if (!this.roleHasPermission(userRole.id, req.permission_code)) {
        checkPath.push('PERMISSION_DENIED_BY_ROLE');
        this.logDeniedAction(req, 'PERMISSION_DENIED_BY_ROLE', checkPath);
        return this.deny('Role does not have this permission', checkPath);
      }
      checkPath.push('ROLE_PERMISSION_OK');

      // Step 5: Check tenant policies (Layer 3)
      const tenant = this.getTenantById(req.tenant_id);
      if (!tenant) {
        checkPath.push('TENANT_NOT_FOUND');
        return this.deny('Tenant not found', checkPath);
      }

      const policyResult = this.validateAgainstTenantPolicies(req, user, tenant);
      if (!policyResult.allowed) {
        checkPath.push(`POLICY_VIOLATION: ${policyResult.reason}`);
        this.logDeniedAction(req, `POLICY_VIOLATION: ${policyResult.reason}`, checkPath);
        return this.deny(`Policy violation: ${policyResult.reason}`, checkPath);
      }
      checkPath.push('TENANT_POLICIES_OK');

      // Step 6: Check scoped permissions
      if (req.scope) {
        if (!this.userHasScopedPermission(req.user_id, req.tenant_id, req.permission_code, req.scope)) {
          checkPath.push('SCOPED_PERMISSION_DENIED');
          this.logDeniedAction(req, 'SCOPED_PERMISSION_DENIED', checkPath);
          return this.deny('User does not have permission for the specified scope', checkPath);
        }
        checkPath.push('SCOPED_PERMISSION_OK');
      }

      // Step 7: Check separation of duties
      const permission = this.getPermissionByCode(req.permission_code);
      if (permission && this.complianceService.violatesSeparationOfDuties(req.user_id, req.tenant_id, req.permission_code)) {
        checkPath.push('SEPARATION_OF_DUTIES_VIOLATION');
        this.logDeniedAction(req, 'SEPARATION_OF_DUTIES_VIOLATION', checkPath);
        return this.deny('Action violates separation of duties compliance rules', checkPath);
      }
      checkPath.push('SEPARATION_OF_DUTIES_OK');

      // Step 8: Check global security controls
      const deniedByGlobal = this.checkGlobalSecurityControls(permission);
      if (deniedByGlobal) {
        checkPath.push(`GLOBAL_CONTROL_ACTIVE: ${deniedByGlobal}`);
        this.logDeniedAction(req, `GLOBAL_CONTROL_ACTIVE: ${deniedByGlobal}`, checkPath);
        return this.deny(`Global control is active: ${deniedByGlobal}`, checkPath);
      }
      checkPath.push('GLOBAL_CONTROLS_OK');

      // All checks passed!
      this.logSuccessfulAction(req, checkPath);
      return this.allow(checkPath);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error evaluating permission:', errorMsg);
      checkPath.push(`ERROR: ${errorMsg}`);
      return this.deny(`Internal error: ${errorMsg}`, checkPath);
    }
  }

  /**
   * Layer 1: Check if user is a member of the tenant
   */
  private userHasAccessToTenant(userId: string, tenantId: string): boolean {
    const membership = this.db
      .prepare('SELECT id FROM user_tenant_memberships WHERE user_id = ? AND tenant_id = ? AND status = ?')
      .get(userId, tenantId, 'active');
    return !!membership;
  }

  /**
   * Layer 2: Check if role has the specific permission
   */
  private roleHasPermission(roleId: string, permissionCode: string): boolean {
    const result = this.db
      .prepare(`
        SELECT rp.id FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ? AND p.code = ?
      `)
      .get(roleId, permissionCode);
    return !!result;
  }

  /**
   * Layer 3: Validate against tenant policies
   */
  private validateAgainstTenantPolicies(
    req: PermissionCheckRequest,
    user: User,
    tenant: Tenant
  ): { allowed: boolean; reason?: string } {
    // Get all active policies for this tenant
    const policies = this.db
      .prepare(`
        SELECT * FROM tenant_policies 
        WHERE tenant_id = ? AND status = 'active'
      `)
      .all(req.tenant_id) as TenantPolicy[];

    for (const policy of policies) {
      // Check MFA policy
      if (policy.policy_key === 'mfa_required') {
        const value = JSON.parse(policy.policy_value || '{}');
        if (value.enabled && !user.mfa_enabled) {
          return { allowed: false, reason: 'MFA is required by tenant policy' };
        }
      }

      // Check automation approval policy
      if (policy.policy_key === 'automation_approval_required') {
        // This would be checked at API layer
      }

      // Add more policy checks as needed
    }

    return { allowed: true };
  }

  /**
   * Scoped Permission Check
   * Allows fine-grained control by region, vendor, technology, etc.
   */
  private userHasScopedPermission(
    userId: string,
    tenantId: string,
    permissionCode: string,
    scope: { type: string; value: string }
  ): boolean {
    // Get the permission ID
    const permission = this.db
      .prepare('SELECT id FROM permissions WHERE code = ?')
      .get(permissionCode) as { id: string } | undefined;

    if (!permission) return false;

    // Get user's role in tenant
    const membership = this.db
      .prepare('SELECT role_id FROM user_tenant_memberships WHERE user_id = ? AND tenant_id = ?')
      .get(userId, tenantId) as { role_id: string } | undefined;

    if (!membership) return false;

    // Check for scoped permission
    const scopedPerm = this.db
      .prepare(`
        SELECT id FROM scoped_permissions 
        WHERE permission_id = ? 
        AND role_id = ? 
        AND scope_type = ? 
        AND scope_value = ?
      `)
      .get(permission.id, membership.role_id, scope.type, scope.value);

    return !!scopedPerm;
  }

  /**
   * Check if any global security controls prevent this action
   */
  private checkGlobalSecurityControls(permission: Permission | null): string | null {
    if (!permission) return null;

    // Check automation kill switch for execute operations
    if (permission.operation === 'execute' && permission.module.toLowerCase().includes('automation')) {
      const killSwitch = this.db
        .prepare('SELECT is_enabled FROM global_security_controls WHERE name = ?')
        .get('automation_kill_switch') as { is_enabled: number } | undefined;
      
      if (killSwitch && killSwitch.is_enabled) {
        return 'automation_kill_switch';
      }
    }

    // Check export freeze for export operations
    if (permission.operation === 'export') {
      const exportFreeze = this.db
        .prepare('SELECT is_enabled FROM global_security_controls WHERE name = ?')
        .get('export_freeze') as { is_enabled: number } | undefined;
      
      if (exportFreeze && exportFreeze.is_enabled) {
        return 'export_freeze';
      }
    }

    // Check emergency read-only mode for write operations
    if (['create', 'edit', 'delete', 'execute'].includes(permission.operation)) {
      const readOnly = this.db
        .prepare('SELECT is_enabled FROM global_security_controls WHERE name = ?')
        .get('emergency_read_only') as { is_enabled: number } | undefined;
      
      if (readOnly && readOnly.is_enabled) {
        return 'emergency_read_only';
      }
    }

    return null;
  }

  // ============================================
  // Helper Methods for Data Fetching
  // ============================================

  private getUserById(userId: string): User | undefined {
    return this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId) as User | undefined;
  }

  private getTenantById(tenantId: string): Tenant | undefined {
    return this.db
      .prepare('SELECT * FROM tenants WHERE id = ?')
      .get(tenantId) as Tenant | undefined;
  }

  private getUserRoleInTenant(userId: string, tenantId: string): Role | undefined {
    return this.db
      .prepare(`
        SELECT r.* FROM roles r
        JOIN user_tenant_memberships utm ON utm.role_id = r.id
        WHERE utm.user_id = ? AND utm.tenant_id = ? AND utm.status = 'active'
      `)
      .get(userId, tenantId) as Role | undefined;
  }

  private getPermissionByCode(code: string): Permission | undefined {
    return this.db
      .prepare('SELECT * FROM permissions WHERE code = ?')
      .get(code) as Permission | undefined;
  }

  // ============================================
  // Logging Methods
  // ============================================

  private logDeniedAction(req: PermissionCheckRequest, reason: string, checkPath: string[]): void {
    try {
      this.auditService.logAction({
        user_id: req.user_id,
        tenant_id: req.tenant_id,
        action: 'permission.denied',
        resource_type: 'permission',
        resource_id: req.permission_code,
        status: 'denied',
        status_reason: reason,
        module: req.permission_code.split('.')[0],
        operation: req.permission_code.split('.')[1],
        ip_address: req.context?.ip_address,
        user_agent: req.context?.user_agent,
        metadata: JSON.stringify({ checkPath, scope: req.scope })
      });
    } catch (error) {
      console.error('Failed to log denied action:', error);
      // Don't throw - logging failure should not block the main flow
    }
  }

  private logSuccessfulAction(req: PermissionCheckRequest, checkPath: string[]): void {
    try {
      this.auditService.logAction({
        user_id: req.user_id,
        tenant_id: req.tenant_id,
        action: 'permission.granted',
        resource_type: 'permission',
        resource_id: req.permission_code,
        status: 'success',
        module: req.permission_code.split('.')[0],
        operation: req.permission_code.split('.')[1],
        ip_address: req.context?.ip_address,
        user_agent: req.context?.user_agent,
        metadata: JSON.stringify({ checkPath, scope: req.scope })
      });
    } catch (error) {
      console.error('Failed to log successful action:', error);
    }
  }

  // ============================================
  // Result assembly
  // ============================================

  private allow(checkPath: string[]): PermissionCheckResult {
    return {
      allowed: true,
      reason: 'Permission granted',
      checkPath
    };
  }

  private deny(reason: string, checkPath: string[]): PermissionCheckResult {
    return {
      allowed: false,
      denialReason: reason,
      checkPath
    };
  }

  /**
   * Get all permissions for a user in a tenant
   * Useful for frontend to show/hide UI elements
   */
  getPermissionsForUser(userId: string, tenantId: string): string[] {
    const membership = this.db
      .prepare('SELECT role_id FROM user_tenant_memberships WHERE user_id = ? AND tenant_id = ? AND status = ?')
      .get(userId, tenantId, 'active') as { role_id: string } | undefined;

    if (!membership) return [];

    const permissions = this.db
      .prepare(`
        SELECT DISTINCT p.code FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        WHERE rp.role_id = ?
      `)
      .all(membership.role_id) as { code: string }[];

    return permissions.map(p => p.code);
  }

  /**
   * Check if user has any of the given permissions
   */
  hasAnyPermission(userId: string, tenantId: string, permissionCodes: string[]): boolean {
    const userPermissions = this.getPermissionsForUser(userId, tenantId);
    return permissionCodes.some(code => userPermissions.includes(code));
  }

  /**
   * Check if user has all of the given permissions
   */
  hasAllPermissions(userId: string, tenantId: string, permissionCodes: string[]): boolean {
    const userPermissions = this.getPermissionsForUser(userId, tenantId);
    return permissionCodes.every(code => userPermissions.includes(code));
  }
}
