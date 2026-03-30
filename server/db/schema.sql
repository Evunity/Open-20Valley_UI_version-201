-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id TEXT REFERENCES tenants(id),
  type TEXT CHECK(type IN ('parent', 'child')) DEFAULT 'child',
  status TEXT CHECK(status IN ('active', 'suspended', 'archived')) DEFAULT 'active',
  country TEXT,
  timezone TEXT,
  organization_type TEXT,
  data_retention_days INTEGER DEFAULT 365,
  security_level TEXT CHECK(security_level IN ('basic', 'standard', 'enhanced', 'critical')) DEFAULT 'standard',
  branding_logo_url TEXT,
  allowed_email_domains TEXT, -- JSON array as string
  ip_allowlist TEXT, -- JSON array as string
  regulatory_profile TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  metadata TEXT -- JSON
);

CREATE INDEX idx_tenants_parent_id ON tenants(parent_id);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'inactive', 'pending')) DEFAULT 'pending',
  mfa_enabled INTEGER DEFAULT 0,
  mfa_secret TEXT,
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT -- JSON
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- User Tenant Memberships (join table)
CREATE TABLE IF NOT EXISTS user_tenant_memberships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id),
  status TEXT CHECK(status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
  assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  assigned_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_memberships_user_id ON user_tenant_memberships(user_id);
CREATE INDEX idx_memberships_tenant_id ON user_tenant_memberships(tenant_id);
CREATE INDEX idx_memberships_role_id ON user_tenant_memberships(role_id);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g., 'topology.view', 'reports.execute'
  module TEXT NOT NULL,
  page TEXT,
  feature TEXT,
  entity_type TEXT,
  operation TEXT CHECK(operation IN ('create', 'read', 'edit', 'delete', 'execute', 'approve', 'export', 'schedule')) NOT NULL,
  description TEXT,
  category TEXT,
  risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  requires_approval INTEGER DEFAULT 0,
  requires_mfa INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_code ON permissions(code);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('system', 'custom')) DEFAULT 'custom',
  description TEXT,
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  UNIQUE(tenant_id, name)
);

CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_status ON roles(status);

-- Role Permissions (join table)
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Scoped Permissions (region, vendor, technology, cluster, object_type)
CREATE TABLE IF NOT EXISTS scoped_permissions (
  id TEXT PRIMARY KEY,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  scope_type TEXT CHECK(scope_type IN ('region', 'vendor', 'technology', 'cluster', 'object_type')) NOT NULL,
  scope_value TEXT NOT NULL, -- e.g., 'EMEA', 'Ericsson', '5G', 'cluster-1', 'Cell'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scoped_permissions_role_id ON scoped_permissions(role_id);
CREATE INDEX idx_scoped_permissions_user_id ON scoped_permissions(user_id);

-- Tenant Policies (inheritance, enforcement)
CREATE TABLE IF NOT EXISTS tenant_policies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  parent_tenant_id TEXT REFERENCES tenants(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'authentication', 'automation', 'export', etc.
  policy_key TEXT, -- e.g., 'mfa_required', 'automation_approval_required'
  policy_value TEXT, -- JSON
  level TEXT CHECK(level IN ('enforced', 'overridable', 'inherited')) DEFAULT 'enforced',
  applies_to_children INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

CREATE INDEX idx_policies_tenant_id ON tenant_policies(tenant_id);
CREATE INDEX idx_policies_parent_tenant_id ON tenant_policies(parent_tenant_id);

-- Access Grants (cross-tenant access)
CREATE TABLE IF NOT EXISTS access_grants (
  id TEXT PRIMARY KEY,
  granted_to_user_id TEXT NOT NULL REFERENCES users(id),
  granted_to_tenant_id TEXT NOT NULL REFERENCES tenants(id),
  granted_from_tenant_id TEXT NOT NULL REFERENCES tenants(id),
  mode TEXT CHECK(mode IN ('read-only', 'operational')) NOT NULL,
  approved_by_user_id TEXT NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'expired', 'revoked')) DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  revoked_by_user_id TEXT REFERENCES users(id)
);

CREATE INDEX idx_access_grants_user_id ON access_grants(granted_to_user_id);
CREATE INDEX idx_access_grants_tenant_id ON access_grants(granted_to_tenant_id);
CREATE INDEX idx_access_grants_status ON access_grants(status);

-- Elevation Requests (Just-In-Time Access)
CREATE TABLE IF NOT EXISTS elevation_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  requested_role_id TEXT NOT NULL REFERENCES roles(id),
  current_role_id TEXT NOT NULL REFERENCES roles(id),
  reason TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'active', 'expired')) DEFAULT 'pending',
  requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  approved_by_user_id TEXT REFERENCES users(id),
  expires_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_elevation_requests_user_id ON elevation_requests(user_id);
CREATE INDEX idx_elevation_requests_tenant_id ON elevation_requests(tenant_id);
CREATE INDEX idx_elevation_requests_status ON elevation_requests(status);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  action TEXT NOT NULL, -- e.g., 'user.created', 'permission.denied'
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('success', 'denied', 'error')) DEFAULT 'success',
  status_reason TEXT,
  module TEXT,
  operation TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT, -- JSON
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Global Security Controls
CREATE TABLE IF NOT EXISTS global_security_controls (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- 'automation_kill_switch', 'export_freeze', etc.
  description TEXT,
  is_enabled INTEGER DEFAULT 0,
  impact TEXT,
  recovery_time TEXT,
  requires_approval INTEGER DEFAULT 1,
  approval_level TEXT, -- 'platform_admin'
  triggered_at TEXT,
  triggered_by_user_id TEXT REFERENCES users(id),
  last_updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_updated_by_user_id TEXT REFERENCES users(id)
);

CREATE INDEX idx_security_controls_name ON global_security_controls(name);

-- Compliance Rules (Separation of Duties)
CREATE TABLE IF NOT EXISTS compliance_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  rule_type TEXT, -- 'prevent_combination'
  prevents TEXT NOT NULL, -- JSON: list of operation combinations to prevent
  severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  enforcement TEXT CHECK(enforcement IN ('prevent', 'warn', 'audit')) DEFAULT 'prevent',
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

CREATE INDEX idx_compliance_rules_tenant_id ON compliance_rules(tenant_id);

-- Module Access Control (what modules are available)
CREATE TABLE IF NOT EXISTS module_access_control (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL, -- 'dashboard', 'reports', 'automation', etc.
  module_name TEXT NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  default_access_level TEXT CHECK(default_access_level IN ('no-access', 'read-only', 'full-access')) DEFAULT 'no-access',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, module_code)
);

CREATE INDEX idx_module_access_tenant_id ON module_access_control(tenant_id);
