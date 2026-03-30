import { getDatabase } from '../db/initialize';
import { Role, Permission, RolePermission } from '../types/access-control';
import { v4 as uuidv4 } from 'uuid';

export interface CreateRoleRequest {
  tenant_id: string;
  name: string;
  type?: 'system' | 'custom';
  description?: string;
  permission_codes?: string[];
  created_by: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

/**
 * Role service
 * Manages roles and their permissions within tenants
 */
export class RoleService {
  private db = getDatabase();

  /**
   * Create a new role
   */
  createRole(req: CreateRoleRequest): Role {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Verify tenant exists
    const tenant = this.db
      .prepare('SELECT id FROM tenants WHERE id = ?')
      .get(req.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Check role name is unique within tenant
    const existing = this.db
      .prepare('SELECT id FROM roles WHERE tenant_id = ? AND name = ?')
      .get(req.tenant_id, req.name);
    if (existing) {
      throw new Error('Role with this name already exists in this tenant');
    }

    this.db
      .prepare(`
        INSERT INTO roles (
          id, tenant_id, name, type, description, status, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        req.tenant_id,
        req.name,
        req.type || 'custom',
        req.description || null,
        'active',
        req.created_by,
        now,
        now
      );

    // Add initial permissions if provided
    if (req.permission_codes && req.permission_codes.length > 0) {
      this.addPermissionsToRole(id, req.permission_codes, req.created_by);
    }

    return this.getRoleById(id)!;
  }

  /**
   * Get role by ID
   */
  getRoleById(roleId: string): Role | undefined {
    return this.db
      .prepare('SELECT * FROM roles WHERE id = ?')
      .get(roleId) as Role | undefined;
  }

  /**
   * List roles in a tenant
   */
  listRoles(tenantId: string, filters?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Role[] {
    let query = 'SELECT * FROM roles WHERE tenant_id = ?';
    const params: any[] = [tenantId];

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY name ASC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    return this.db.prepare(query).all(...params) as Role[];
  }

  /**
   * Update role
   */
  updateRole(roleId: string, updates: UpdateRoleRequest): Role | undefined {
    const role = this.getRoleById(roleId);
    if (!role) return undefined;

    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE roles SET
          name = ?,
          description = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        updates.name || role.name,
        updates.description || role.description,
        updates.status || role.status,
        now,
        roleId
      );

    return this.getRoleById(roleId);
  }

  /**
   * Delete/deactivate a role
   */
  deleteRole(roleId: string): void {
    this.db
      .prepare('UPDATE roles SET status = ?, updated_at = ? WHERE id = ?')
      .run('inactive', new Date().toISOString(), roleId);
  }

  /**
   * Add permission(s) to a role
   */
  addPermissionsToRole(roleId: string, permissionCodes: string[], addedBy: string): void {
    const role = this.getRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    for (const code of permissionCodes) {
      // Get permission ID by code
      const permission = this.db
        .prepare('SELECT id FROM permissions WHERE code = ?')
        .get(code) as { id: string } | undefined;

      if (!permission) {
        throw new Error(`Permission not found: ${code}`);
      }

      // Check if permission is already assigned
      const existing = this.db
        .prepare('SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?')
        .get(roleId, permission.id);

      if (!existing) {
        const id = uuidv4();
        this.db
          .prepare(`
            INSERT INTO role_permissions (id, role_id, permission_id, created_by, created_at)
            VALUES (?, ?, ?, ?, ?)
          `)
          .run(id, roleId, permission.id, addedBy, new Date().toISOString());
      }
    }
  }

  /**
   * Remove permission(s) from a role
   */
  removePermissionsFromRole(roleId: string, permissionCodes: string[]): void {
    for (const code of permissionCodes) {
      const permission = this.db
        .prepare('SELECT id FROM permissions WHERE code = ?')
        .get(code) as { id: string } | undefined;

      if (permission) {
        this.db
          .prepare('DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?')
          .run(roleId, permission.id);
      }
    }
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(roleId: string): Permission[] {
    return this.db
      .prepare(`
        SELECT p.* FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        WHERE rp.role_id = ?
        ORDER BY p.module, p.code
      `)
      .all(roleId) as Permission[];
  }

  /**
   * Get roles that have a specific permission
   */
  getRolesByPermission(tenantId: string, permissionCode: string): Role[] {
    return this.db
      .prepare(`
        SELECT DISTINCT r.* FROM roles r
        JOIN role_permissions rp ON rp.role_id = r.id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE r.tenant_id = ? AND p.code = ? AND r.status = 'active'
      `)
      .all(tenantId, permissionCode) as Role[];
  }

  /**
   * Get count of users with this role
   */
  getRoleUserCount(roleId: string): number {
    const result = this.db
      .prepare('SELECT COUNT(*) as count FROM user_tenant_memberships WHERE role_id = ? AND status = ?')
      .get(roleId, 'active') as { count: number };

    return result.count;
  }

  /**
   * Check if role has permission
   */
  roleHasPermission(roleId: string, permissionCode: string): boolean {
    const result = this.db
      .prepare(`
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = ? AND p.code = ?
      `)
      .get(roleId, permissionCode);

    return !!result;
  }

  /**
   * Replace all permissions for a role
   * Useful for bulk updating
   */
  setRolePermissions(roleId: string, permissionCodes: string[], updatedBy: string): void {
    // Remove all existing permissions
    this.db
      .prepare('DELETE FROM role_permissions WHERE role_id = ?')
      .run(roleId);

    // Add new permissions
    if (permissionCodes.length > 0) {
      this.addPermissionsToRole(roleId, permissionCodes, updatedBy);
    }
  }

  /**
   * Get role with all its permissions
   */
  getRoleWithPermissions(roleId: string): (Role & { permissions: Permission[] }) | undefined {
    const role = this.getRoleById(roleId);
    if (!role) return undefined;

    const permissions = this.getRolePermissions(roleId);

    return {
      ...role,
      permissions
    };
  }

  /**
   * Get roles grouped by permission type
   */
  getRolesGroupedByPermission(tenantId: string): Record<string, string[]> {
    const roles = this.listRoles(tenantId);
    const grouped: Record<string, string[]> = {};

    for (const role of roles) {
      const permissions = this.getRolePermissions(role.id);
      grouped[role.id] = permissions.map(p => p.code);
    }

    return grouped;
  }

  /**
   * Get default system roles for a tenant
   */
  getSystemRoles(tenantId: string): Role[] {
    return this.listRoles(tenantId, { type: 'system', status: 'active' });
  }

  /**
   * Get permission matrix for a role
   * Shows which modules/operations the role has access to
   */
  getRolePermissionMatrix(roleId: string): Record<string, Record<string, boolean>> {
    const permissions = this.getRolePermissions(roleId);
    const matrix: Record<string, Record<string, boolean>> = {};

    for (const perm of permissions) {
      if (!matrix[perm.module]) {
        matrix[perm.module] = {};
      }
      matrix[perm.module][perm.operation] = true;
    }

    return matrix;
  }

  /**
   * Get permission coverage for a role
   */
  getRolePermissionCoverage(roleId: string): {
    total_permissions: number;
    assigned_permissions: number;
    coverage_percent: number;
  } {
    const total = this.db
      .prepare('SELECT COUNT(*) as count FROM permissions')
      .get() as { count: number };

    const assigned = this.getRolePermissions(roleId).length;

    return {
      total_permissions: total.count,
      assigned_permissions: assigned,
      coverage_percent: total.count > 0 ? Math.round((assigned / total.count) * 100) : 0
    };
  }
}
