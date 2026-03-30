import { getDatabase } from '../db/initialize';
import { Tenant } from '../types/access-control';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTenantRequest {
  name: string;
  parent_id?: string;
  type?: 'parent' | 'child';
  country?: string;
  timezone?: string;
  organization_type?: string;
  data_retention_days?: number;
  security_level?: 'basic' | 'standard' | 'enhanced' | 'critical';
  branding_logo_url?: string;
  allowed_email_domains?: string[];
  ip_allowlist?: string[];
  regulatory_profile?: string;
  created_by: string;
}

export interface UpdateTenantRequest {
  name?: string;
  country?: string;
  timezone?: string;
  organization_type?: string;
  data_retention_days?: number;
  security_level?: string;
  branding_logo_url?: string;
  allowed_email_domains?: string[];
  ip_allowlist?: string[];
  regulatory_profile?: string;
  status?: 'active' | 'suspended' | 'archived';
}

/**
 * Tenant service
 * Manages tenant creation, hierarchy, and configuration
 */
export class TenantService {
  private db = getDatabase();

  /**
   * Create a new tenant
   */
  createTenant(req: CreateTenantRequest): Tenant {
    const id = uuidv4();
    const slug = this.generateSlug(req.name);
    const now = new Date().toISOString();

    // Validate parent exists if creating child tenant
    if (req.parent_id) {
      const parent = this.getTenantById(req.parent_id);
      if (!parent) {
        throw new Error('Parent tenant not found');
      }
    }

    this.db
      .prepare(`
        INSERT INTO tenants (
          id, name, slug, parent_id, type, status, country, timezone,
          organization_type, data_retention_days, security_level,
          branding_logo_url, allowed_email_domains, ip_allowlist,
          regulatory_profile, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        req.name,
        slug,
        req.parent_id || null,
        req.type || 'child',
        'active',
        req.country || null,
        req.timezone || null,
        req.organization_type || null,
        req.data_retention_days || 365,
        req.security_level || 'standard',
        req.branding_logo_url || null,
        req.allowed_email_domains ? JSON.stringify(req.allowed_email_domains) : null,
        req.ip_allowlist ? JSON.stringify(req.ip_allowlist) : null,
        req.regulatory_profile || null,
        req.created_by,
        now,
        now
      );

    return this.getTenantById(id)!;
  }

  /**
   * Get tenant by ID
   */
  getTenantById(tenantId: string): Tenant | undefined {
    return this.db
      .prepare('SELECT * FROM tenants WHERE id = ?')
      .get(tenantId) as Tenant | undefined;
  }

  /**
   * Get tenant by slug
   */
  getTenantBySlug(slug: string): Tenant | undefined {
    return this.db
      .prepare('SELECT * FROM tenants WHERE slug = ?')
      .get(slug) as Tenant | undefined;
  }

  /**
   * List all tenants (with optional filters)
   */
  listTenants(filters?: {
    status?: string;
    type?: string;
    parent_id?: string;
    limit?: number;
    offset?: number;
  }): Tenant[] {
    let query = 'SELECT * FROM tenants WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.parent_id) {
      query += ' AND parent_id = ?';
      params.push(filters.parent_id);
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

    return this.db.prepare(query).all(...params) as Tenant[];
  }

  /**
   * Get all active tenants
   */
  getActiveTenants(): Tenant[] {
    return this.listTenants({ status: 'active' });
  }

  /**
   * Update tenant
   */
  updateTenant(tenantId: string, updates: UpdateTenantRequest): Tenant | undefined {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) return undefined;

    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE tenants SET
          name = ?,
          country = ?,
          timezone = ?,
          organization_type = ?,
          data_retention_days = ?,
          security_level = ?,
          branding_logo_url = ?,
          allowed_email_domains = ?,
          ip_allowlist = ?,
          regulatory_profile = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        updates.name || tenant.name,
        updates.country || tenant.country,
        updates.timezone || tenant.timezone,
        updates.organization_type || tenant.organization_type,
        updates.data_retention_days !== undefined ? updates.data_retention_days : tenant.data_retention_days,
        updates.security_level || tenant.security_level,
        updates.branding_logo_url || tenant.branding_logo_url,
        updates.allowed_email_domains ? JSON.stringify(updates.allowed_email_domains) : tenant.allowed_email_domains,
        updates.ip_allowlist ? JSON.stringify(updates.ip_allowlist) : tenant.ip_allowlist,
        updates.regulatory_profile || tenant.regulatory_profile,
        updates.status || tenant.status,
        now,
        tenantId
      );

    return this.getTenantById(tenantId);
  }

  /**
   * Delete/archive a tenant
   */
  deleteTenant(tenantId: string): void {
    this.db
      .prepare('UPDATE tenants SET status = ?, updated_at = ? WHERE id = ?')
      .run('archived', new Date().toISOString(), tenantId);
  }

  /**
   * Get tenant hierarchy (parent and children)
   */
  getTenantHierarchy(tenantId: string): {
    tenant: Tenant;
    parent?: Tenant;
    children: Tenant[];
  } | undefined {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) return undefined;

    let parent: Tenant | undefined;
    if (tenant.parent_id) {
      parent = this.getTenantById(tenant.parent_id);
    }

    const children = this.listTenants({ parent_id: tenantId });

    return { tenant, parent, children };
  }

  /**
   * Get all descendants of a tenant
   */
  getAllDescendants(tenantId: string): Tenant[] {
    const children = this.listTenants({ parent_id: tenantId });
    let descendants = [...children];

    for (const child of children) {
      descendants = [...descendants, ...this.getAllDescendants(child.id)];
    }

    return descendants;
  }

  /**
   * Get all ancestors of a tenant
   */
  getAllAncestors(tenantId: string): Tenant[] {
    const tenant = this.getTenantById(tenantId);
    if (!tenant || !tenant.parent_id) return [];

    const parent = this.getTenantById(tenant.parent_id);
    if (!parent) return [];

    return [parent, ...this.getAllAncestors(parent.id)];
  }

  /**
   * Check if tenantA is a descendant of tenantB
   */
  isDescendantOf(tenantA: string, tenantB: string): boolean {
    const ancestors = this.getAllAncestors(tenantA);
    return ancestors.some(a => a.id === tenantB);
  }

  /**
   * Get user count for a tenant
   */
  getTenantUserCount(tenantId: string): number {
    const result = this.db
      .prepare(`
        SELECT COUNT(DISTINCT user_id) as count FROM user_tenant_memberships
        WHERE tenant_id = ? AND status = 'active'
      `)
      .get(tenantId) as { count: number };

    return result.count;
  }

  /**
   * Get role count for a tenant
   */
  getTenantRoleCount(tenantId: string): number {
    const result = this.db
      .prepare('SELECT COUNT(*) as count FROM roles WHERE tenant_id = ? AND status = ?')
      .get(tenantId, 'active') as { count: number };

    return result.count;
  }

  /**
   * Suspend a tenant (prevents access without deleting data)
   */
  suspendTenant(tenantId: string): Tenant | undefined {
    return this.updateTenant(tenantId, { status: 'suspended' });
  }

  /**
   * Reactivate a suspended tenant
   */
  reactivateTenant(tenantId: string): Tenant | undefined {
    return this.updateTenant(tenantId, { status: 'active' });
  }

  /**
   * Get tenant statistics
   */
  getTenantStats(tenantId: string): {
    user_count: number;
    role_count: number;
    active_policies: number;
    total_permissions: number;
  } {
    const userCount = this.getTenantUserCount(tenantId);
    const roleCount = this.getTenantRoleCount(tenantId);

    const policies = this.db
      .prepare('SELECT COUNT(*) as count FROM tenant_policies WHERE tenant_id = ? AND status = ?')
      .get(tenantId, 'active') as { count: number };

    const permissions = this.db
      .prepare('SELECT COUNT(DISTINCT permission_id) as count FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE tenant_id = ?)')
      .get(tenantId) as { count: number };

    return {
      user_count: userCount,
      role_count: roleCount,
      active_policies: policies.count,
      total_permissions: permissions.count
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-');
  }
}
