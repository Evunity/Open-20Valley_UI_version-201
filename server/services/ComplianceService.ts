import { getDatabase } from '../db/initialize';
import { ComplianceRule, User } from '../types/access-control';
import { v4 as uuidv4 } from 'uuid';

/**
 * Compliance service
 * Enforces separation of duties and prevents dangerous permission combinations
 */
export class ComplianceService {
  private db = getDatabase();

  /**
   * Check if a user violates any separation of duties rules for a permission
   */
  violatesSeparationOfDuties(userId: string, tenantId: string, permissionCode: string): boolean {
    // Get all active compliance rules for this tenant
    const rules = this.db
      .prepare(`
        SELECT * FROM compliance_rules
        WHERE tenant_id = ? AND status = 'active' AND enforcement = 'prevent'
      `)
      .all(tenantId) as ComplianceRule[];

    for (const rule of rules) {
      if (rule.prevents) {
        try {
          const prevents = JSON.parse(rule.prevents);
          
          // Check if this rule applies to the current permission
          if (prevents.operations && prevents.operations.includes(permissionCode)) {
            // Check if user has any conflicting permissions
            for (const conflictingOp of prevents.operations) {
              if (conflictingOp !== permissionCode && this.userHasPermission(userId, tenantId, conflictingOp)) {
                return true;
              }
            }
          }
        } catch (error) {
          console.error(`Failed to parse compliance rule ${rule.id}:`, error);
        }
      }
    }

    return false;
  }

  /**
   * Get all violations for a user (warnings, not enforced)
   */
  getComplianceWarnings(userId: string, tenantId: string): ComplianceRule[] {
    const rules = this.db
      .prepare(`
        SELECT * FROM compliance_rules
        WHERE tenant_id = ? AND status = 'active' AND enforcement = 'warn'
      `)
      .all(tenantId) as ComplianceRule[];

    const violations: ComplianceRule[] = [];

    for (const rule of rules) {
      if (rule.prevents) {
        try {
          const prevents = JSON.parse(rule.prevents);
          let hasViolation = false;

          // Check if user has all the dangerous combinations
          if (prevents.operations) {
            const userPermissions = this.getUserPermissions(userId, tenantId);
            hasViolation = prevents.operations.every((op: string) => userPermissions.includes(op));
          }

          if (hasViolation) {
            violations.push(rule);
          }
        } catch (error) {
          console.error(`Failed to parse compliance rule ${rule.id}:`, error);
        }
      }
    }

    return violations;
  }

  /**
   * Create a new compliance rule
   */
  createComplianceRule(
    tenantId: string,
    name: string,
    description: string,
    prevents: string[], // Array of permission codes
    severity: 'low' | 'medium' | 'high' | 'critical',
    enforcement: 'prevent' | 'warn' | 'audit',
    createdBy: string
  ): ComplianceRule {
    const id = uuidv4();
    const preventsJson = JSON.stringify({ operations: prevents });

    this.db
      .prepare(`
        INSERT INTO compliance_rules (
          id, tenant_id, name, description, rule_type, prevents,
          severity, enforcement, status, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        tenantId,
        name,
        description,
        'prevent_combination',
        preventsJson,
        severity,
        enforcement,
        'active',
        createdBy,
        new Date().toISOString()
      );

    return this.getComplianceRuleById(id)!;
  }

  /**
   * Get all compliance rules for a tenant
   */
  getComplianceRules(tenantId: string, status = 'active'): ComplianceRule[] {
    return this.db
      .prepare(`
        SELECT * FROM compliance_rules
        WHERE tenant_id = ? AND status = ?
        ORDER BY created_at DESC
      `)
      .all(tenantId, status) as ComplianceRule[];
  }

  /**
   * Get a compliance rule by ID
   */
  getComplianceRuleById(ruleId: string): ComplianceRule | undefined {
    return this.db
      .prepare('SELECT * FROM compliance_rules WHERE id = ?')
      .get(ruleId) as ComplianceRule | undefined;
  }

  /**
   * Update a compliance rule
   */
  updateComplianceRule(
    ruleId: string,
    updates: {
      name?: string;
      description?: string;
      severity?: string;
      enforcement?: string;
      status?: string;
    }
  ): ComplianceRule | undefined {
    const rule = this.getComplianceRuleById(ruleId);
    if (!rule) return undefined;

    const stmt = this.db.prepare(`
      UPDATE compliance_rules
      SET
        name = ?,
        description = ?,
        severity = ?,
        enforcement = ?,
        status = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.name || rule.name,
      updates.description || rule.description,
      updates.severity || rule.severity,
      updates.enforcement || rule.enforcement,
      updates.status || rule.status,
      ruleId
    );

    return this.getComplianceRuleById(ruleId);
  }

  /**
   * Delete a compliance rule
   */
  deleteComplianceRule(ruleId: string): void {
    this.db
      .prepare('DELETE FROM compliance_rules WHERE id = ?')
      .run(ruleId);
  }

  /**
   * Generate compliance report for a tenant
   */
  generateComplianceReport(tenantId: string): {
    total_rules: number;
    active_rules: number;
    enforcement_breakdown: Record<string, number>;
    severity_breakdown: Record<string, number>;
  } {
    const rules = this.getComplianceRules(tenantId, 'active');

    const enforcement_breakdown: Record<string, number> = {
      prevent: 0,
      warn: 0,
      audit: 0
    };

    const severity_breakdown: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    for (const rule of rules) {
      enforcement_breakdown[rule.enforcement] = (enforcement_breakdown[rule.enforcement] || 0) + 1;
      severity_breakdown[rule.severity] = (severity_breakdown[rule.severity] || 0) + 1;
    }

    return {
      total_rules: rules.length,
      active_rules: rules.filter(r => r.status === 'active').length,
      enforcement_breakdown,
      severity_breakdown
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private userHasPermission(userId: string, tenantId: string, permissionCode: string): boolean {
    const result = this.db
      .prepare(`
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        JOIN user_tenant_memberships utm ON utm.role_id = rp.role_id
        WHERE utm.user_id = ? AND utm.tenant_id = ? AND p.code = ?
      `)
      .get(userId, tenantId, permissionCode);

    return !!result;
  }

  private getUserPermissions(userId: string, tenantId: string): string[] {
    const permissions = this.db
      .prepare(`
        SELECT DISTINCT p.code FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        JOIN user_tenant_memberships utm ON utm.role_id = rp.role_id
        WHERE utm.user_id = ? AND utm.tenant_id = ?
      `)
      .all(userId, tenantId) as { code: string }[];

    return permissions.map(p => p.code);
  }
}
