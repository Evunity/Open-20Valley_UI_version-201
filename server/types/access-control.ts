// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  type: 'parent' | 'child';
  status: 'active' | 'suspended' | 'archived';
  country: string | null;
  timezone: string | null;
  organization_type: string | null;
  data_retention_days: number;
  security_level: 'basic' | 'standard' | 'enhanced' | 'critical';
  branding_logo_url: string | null;
  allowed_email_domains: string | null; // JSON string
  ip_allowlist: string | null; // JSON string
  regulatory_profile: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  metadata: string | null; // JSON string
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  status: 'active' | 'inactive' | 'pending';
  mfa_enabled: number; // 0 or 1 (SQLite boolean)
  mfa_secret: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  metadata: string | null; // JSON string
}

// Membership Types
export interface UserTenantMembership {
  id: string;
  user_id: string;
  tenant_id: string;
  role_id: string;
  status: 'active' | 'inactive' | 'pending';
  assigned_at: string;
  assigned_by: string | null;
  created_at: string;
}

// Permission Types
export interface Permission {
  id: string;
  code: string; // e.g., 'topology.view'
  module: string; // e.g., 'Topology'
  page: string | null;
  feature: string | null;
  entity_type: string | null;
  operation: 'create' | 'read' | 'edit' | 'delete' | 'execute' | 'approve' | 'export' | 'schedule';
  description: string | null;
  category: string | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_approval: number; // 0 or 1
  requires_mfa: number; // 0 or 1
  created_at: string;
}

// Role Types
export interface Role {
  id: string;
  tenant_id: string;
  name: string;
  type: 'system' | 'custom';
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Role Permission Types
export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
  created_by: string | null;
}

// Scoped Permission Types
export interface ScopedPermission {
  id: string;
  permission_id: string;
  role_id: string;
  user_id: string | null;
  scope_type: 'region' | 'vendor' | 'technology' | 'cluster' | 'object_type';
  scope_value: string;
  created_at: string;
}

// Policy Types
export interface TenantPolicy {
  id: string;
  tenant_id: string;
  parent_tenant_id: string | null;
  name: string;
  category: string;
  policy_key: string | null;
  policy_value: string | null; // JSON string
  level: 'enforced' | 'overridable' | 'inherited';
  applies_to_children: number; // 0 or 1
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Access Grant Types (cross-tenant)
export interface AccessGrant {
  id: string;
  granted_to_user_id: string;
  granted_to_tenant_id: string;
  granted_from_tenant_id: string;
  mode: 'read-only' | 'operational';
  approved_by_user_id: string;
  reason: string;
  expires_at: string;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
  revoked_at: string | null;
  revoked_by_user_id: string | null;
}

// Elevation Request Types
export interface ElevationRequest {
  id: string;
  user_id: string;
  tenant_id: string;
  requested_role_id: string;
  current_role_id: string;
  reason: string;
  duration_hours: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired';
  requested_at: string;
  approved_at: string | null;
  approved_by_user_id: string | null;
  expires_at: string | null;
  created_at: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string;
  tenant_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: 'success' | 'denied' | 'error';
  status_reason: string | null;
  module: string | null;
  operation: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: string | null; // JSON string
  timestamp: string;
  created_at: string;
}

// Global Security Control Types
export interface GlobalSecurityControl {
  id: string;
  name: string;
  description: string | null;
  is_enabled: number; // 0 or 1
  impact: string | null;
  recovery_time: string | null;
  requires_approval: number; // 0 or 1
  approval_level: string | null;
  triggered_at: string | null;
  triggered_by_user_id: string | null;
  last_updated_at: string;
  last_updated_by_user_id: string | null;
}

// Compliance Rule Types
export interface ComplianceRule {
  id: string;
  tenant_id: string;
  name: string;
  category: string | null;
  description: string | null;
  rule_type: string | null;
  prevents: string; // JSON string
  severity: 'low' | 'medium' | 'high' | 'critical';
  enforcement: 'prevent' | 'warn' | 'audit';
  status: 'active' | 'inactive';
  created_at: string;
  created_by: string | null;
}

// Module Access Control Types
export interface ModuleAccessControl {
  id: string;
  tenant_id: string;
  module_code: string;
  module_name: string;
  is_enabled: number; // 0 or 1
  default_access_level: 'no-access' | 'read-only' | 'full-access';
  created_at: string;
  updated_at: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    userTenant?: string;
  };
}

export interface PermissionEvaluationRequest {
  user_id: string;
  tenant_id: string;
  permission_code: string;
  scope?: {
    type: 'region' | 'vendor' | 'technology' | 'cluster' | 'object_type';
    value: string;
  };
}

export interface PermissionEvaluationResult {
  allowed: boolean;
  reason?: string;
  denialReason?: string;
}

export interface UserWithTenants extends User {
  tenants?: Array<{
    tenant_id: string;
    tenant_name: string;
    role_name: string;
    role_id: string;
    status: string;
  }>;
}

export interface RoleWithPermissions extends Role {
  permissions?: Permission[];
  memberCount?: number;
}

export interface TenantWithHierarchy extends Tenant {
  parent?: Tenant | null;
  children?: Tenant[];
  userCount?: number;
  roleCount?: number;
}
