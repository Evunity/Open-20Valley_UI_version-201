import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export function seedDatabase(db: Database.Database): void {
  // Create transactions to ensure atomicity
  const insertTenant = db.prepare(`
    INSERT INTO tenants (id, name, slug, parent_id, type, status, country, timezone, organization_type, security_level, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, password_hash, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertRole = db.prepare(`
    INSERT INTO roles (id, tenant_id, name, type, description, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertPermission = db.prepare(`
    INSERT INTO permissions (id, code, module, operation, description, category, risk_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertRolePermission = db.prepare(`
    INSERT INTO role_permissions (id, role_id, permission_id, created_by)
    VALUES (?, ?, ?, ?)
  `);
  
  const insertMembership = db.prepare(`
    INSERT INTO user_tenant_memberships (id, user_id, tenant_id, role_id, status, assigned_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertPolicy = db.prepare(`
    INSERT INTO tenant_policies (id, tenant_id, name, category, policy_key, policy_value, level, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertGlobalControl = db.prepare(`
    INSERT INTO global_security_controls (id, name, description, is_enabled, impact, recovery_time, requires_approval, approval_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertModuleAccess = db.prepare(`
    INSERT INTO module_access_control (id, tenant_id, module_code, module_name, is_enabled, default_access_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'salt').digest('hex');
  }

  // --- TENANTS ---
  const platformAdminId = uuidv4();
  const telecomGroupId = uuidv4();
  const egyptOpId = uuidv4();
  const saudiOpId = uuidv4();
  const managedServicesId = uuidv4();
  const enterpriseNetId = uuidv4();

  // Platform/System Admin tenant
  insertTenant.run(
    platformAdminId,
    'Platform Administration',
    'platform-admin',
    null,
    'parent',
    'active',
    'Global',
    'UTC',
    'System',
    'critical',
    null
  );

  // Telecom Group (Parent)
  insertTenant.run(
    telecomGroupId,
    'Telecom Group',
    'telecom-group',
    null,
    'parent',
    'active',
    'MENA',
    'UTC',
    'Holding Company',
    'enhanced',
    null
  );

  // Egypt Operator (Child)
  insertTenant.run(
    egyptOpId,
    'Egypt Operations',
    'egypt-ops',
    telecomGroupId,
    'child',
    'active',
    'Egypt',
    'Africa/Cairo',
    'Telecom Operator',
    'enhanced',
    null
  );

  // Saudi Operator (Child)
  insertTenant.run(
    saudiOpId,
    'Saudi Operations',
    'saudi-ops',
    telecomGroupId,
    'child',
    'active',
    'Saudi Arabia',
    'Asia/Riyadh',
    'Telecom Operator',
    'enhanced',
    null
  );

  // Managed Services Division (Child)
  insertTenant.run(
    managedServicesId,
    'Managed Services',
    'managed-services',
    telecomGroupId,
    'child',
    'active',
    'Global',
    'UTC',
    'Service Provider',
    'standard',
    null
  );

  // Enterprise Private Network (Child)
  insertTenant.run(
    enterpriseNetId,
    'Enterprise Network',
    'enterprise-network',
    telecomGroupId,
    'child',
    'active',
    'Multi-country',
    'UTC',
    'Enterprise',
    'standard',
    null
  );

  // --- USERS ---
  const adminUserId = uuidv4();
  const egyptAdminId = uuidv4();
  const saudiAdminId = uuidv4();
  const rfEngineerId = uuidv4();
  const operatorId = uuidv4();
  const auditorId = uuidv4();

  insertUser.run(adminUserId, 'admin@platform.com', 'System Administrator', hashPassword('admin123'), 'active', new Date().toISOString());
  insertUser.run(egyptAdminId, 'egypt-admin@telecom.com', 'Ahmed Hassan', hashPassword('egypt123'), 'active', new Date().toISOString());
  insertUser.run(saudiAdminId, 'saudi-admin@telecom.com', 'Mohammed Al-Rashid', hashPassword('saudi123'), 'active', new Date().toISOString());
  insertUser.run(rfEngineerId, 'rf-engineer@egypt.com', 'Fatima Al-Mansouri', hashPassword('engineer123'), 'active', new Date().toISOString());
  insertUser.run(operatorId, 'operator@egypt.com', 'Ahmed Karim', hashPassword('operator123'), 'active', new Date().toISOString());
  insertUser.run(auditorId, 'auditor@telecom.com', 'Lisa Chen', hashPassword('audit123'), 'active', new Date().toISOString());

  // --- PERMISSIONS (Global, available to all tenants) ---
  const permissions = [
    // Dashboard
    { code: 'dashboard.view', module: 'Dashboard', op: 'read', desc: 'View dashboard', cat: 'Dashboard', risk: 'low' },
    { code: 'dashboard.edit', module: 'Dashboard', op: 'edit', desc: 'Edit dashboard widgets', cat: 'Dashboard', risk: 'medium' },
    
    // Topology
    { code: 'topology.view', module: 'Topology', op: 'read', desc: 'View network topology', cat: 'Topology', risk: 'low' },
    { code: 'topology.edit', module: 'Topology', op: 'edit', desc: 'Edit topology', cat: 'Topology', risk: 'high' },
    { code: 'topology.delete', module: 'Topology', op: 'delete', desc: 'Delete nodes/cells', cat: 'Topology', risk: 'critical' },
    
    // Reports
    { code: 'reports.view', module: 'Reports', op: 'read', desc: 'View reports', cat: 'Reports', risk: 'low' },
    { code: 'reports.create', module: 'Reports', op: 'create', desc: 'Create reports', cat: 'Reports', risk: 'medium' },
    { code: 'reports.export', module: 'Reports', op: 'export', desc: 'Export reports', cat: 'Reports', risk: 'medium' },
    
    // Automation
    { code: 'automation.view', module: 'Automation', op: 'read', desc: 'View automations', cat: 'Automation', risk: 'low' },
    { code: 'automation.create', module: 'Automation', op: 'create', desc: 'Create automation', cat: 'Automation', risk: 'high' },
    { code: 'automation.execute', module: 'Automation', op: 'execute', desc: 'Execute automation', cat: 'Automation', risk: 'critical' },
    { code: 'automation.approve', module: 'Automation', op: 'approve', desc: 'Approve automation execution', cat: 'Automation', risk: 'critical' },
    
    // Command Center
    { code: 'command.view', module: 'CommandCenter', op: 'read', desc: 'View command center', cat: 'CommandCenter', risk: 'low' },
    { code: 'command.execute', module: 'CommandCenter', op: 'execute', desc: 'Execute commands', cat: 'CommandCenter', risk: 'critical' },
    
    // Alarms
    { code: 'alarms.view', module: 'AlarmMgmt', op: 'read', desc: 'View alarms', cat: 'AlarmMgmt', risk: 'low' },
    { code: 'alarms.clear', module: 'AlarmMgmt', op: 'edit', desc: 'Clear alarms', cat: 'AlarmMgmt', risk: 'medium' },
    
    // Access Control
    { code: 'access.manage', module: 'AccessControl', op: 'edit', desc: 'Manage access control', cat: 'AccessControl', risk: 'critical' },
    { code: 'access.view', module: 'AccessControl', op: 'read', desc: 'View access control', cat: 'AccessControl', risk: 'medium' },
  ];

  const permissionIds: Record<string, string> = {};
  for (const perm of permissions) {
    const id = uuidv4();
    permissionIds[perm.code] = id;
    insertPermission.run(id, perm.code, perm.module, perm.op, perm.desc, perm.cat, perm.risk);
  }

  // --- ROLES ---
  const platformAdminRoleId = uuidv4();
  const tenantAdminRoleId = uuidv4();
  const rfEngineerRoleId = uuidv4();
  const operatorRoleId = uuidv4();
  const auditorRoleId = uuidv4();
  const viewerRoleId = uuidv4();

  // Platform Admin Role
  insertRole.run(platformAdminRoleId, platformAdminId, 'System Admin', 'system', 'Full platform access', 'active', null);
  
  // Tenant-scoped Roles (in Egypt tenant)
  insertRole.run(tenantAdminRoleId, egyptOpId, 'Tenant Admin', 'system', 'Tenant administrator', 'active', egyptAdminId);
  insertRole.run(rfEngineerRoleId, egyptOpId, 'RF Engineer', 'custom', 'Radio frequency engineer', 'active', egyptAdminId);
  insertRole.run(operatorRoleId, egyptOpId, 'Operator', 'custom', 'Network operator', 'active', egyptAdminId);
  insertRole.run(auditorRoleId, egyptOpId, 'Auditor', 'custom', 'Compliance auditor', 'active', egyptAdminId);
  insertRole.run(viewerRoleId, egyptOpId, 'Viewer', 'system', 'Read-only viewer', 'active', egyptAdminId);

  // --- ASSIGN PERMISSIONS TO ROLES ---
  // Platform Admin - All permissions
  for (const permId of Object.values(permissionIds)) {
    insertRolePermission.run(uuidv4(), platformAdminRoleId, permId, null);
  }

  // Tenant Admin - Most permissions except some critical ones
  const tenantAdminPerms = [
    'dashboard.view', 'dashboard.edit',
    'topology.view', 'topology.edit',
    'reports.view', 'reports.create', 'reports.export',
    'automation.view', 'automation.create', 'automation.approve',
    'command.view',
    'alarms.view', 'alarms.clear',
    'access.manage', 'access.view'
  ];
  for (const code of tenantAdminPerms) {
    insertRolePermission.run(uuidv4(), tenantAdminRoleId, permissionIds[code], egyptAdminId);
  }

  // RF Engineer
  const rfEngineerPerms = [
    'dashboard.view',
    'topology.view', 'topology.edit',
    'reports.view', 'reports.export',
    'command.view',
    'alarms.view'
  ];
  for (const code of rfEngineerPerms) {
    insertRolePermission.run(uuidv4(), rfEngineerRoleId, permissionIds[code], egyptAdminId);
  }

  // Operator
  const operatorPerms = [
    'dashboard.view',
    'topology.view',
    'reports.view',
    'automation.view',
    'command.view',
    'alarms.view', 'alarms.clear'
  ];
  for (const code of operatorPerms) {
    insertRolePermission.run(uuidv4(), operatorRoleId, permissionIds[code], egyptAdminId);
  }

  // Auditor
  const auditorPerms = ['dashboard.view', 'topology.view', 'reports.view', 'alarms.view', 'access.view'];
  for (const code of auditorPerms) {
    insertRolePermission.run(uuidv4(), auditorRoleId, permissionIds[code], egyptAdminId);
  }

  // Viewer
  const viewerPerms = ['dashboard.view', 'topology.view', 'reports.view', 'alarms.view'];
  for (const code of viewerPerms) {
    insertRolePermission.run(uuidv4(), viewerRoleId, permissionIds[code], egyptAdminId);
  }

  // --- USER MEMBERSHIPS ---
  insertMembership.run(uuidv4(), adminUserId, platformAdminId, platformAdminRoleId, 'active', null);
  insertMembership.run(uuidv4(), egyptAdminId, egyptOpId, tenantAdminRoleId, 'active', adminUserId);
  insertMembership.run(uuidv4(), rfEngineerId, egyptOpId, rfEngineerRoleId, 'active', egyptAdminId);
  insertMembership.run(uuidv4(), operatorId, egyptOpId, operatorRoleId, 'active', egyptAdminId);
  insertMembership.run(uuidv4(), auditorId, egyptOpId, auditorRoleId, 'active', egyptAdminId);
  insertMembership.run(uuidv4(), saudiAdminId, saudiOpId, tenantAdminRoleId, 'active', adminUserId);

  // --- TENANT POLICIES ---
  insertPolicy.run(
    uuidv4(),
    egyptOpId,
    'MFA Required',
    'authentication',
    'mfa_required',
    JSON.stringify({ enabled: true, enforced: true }),
    'enforced',
    'active',
    egyptAdminId
  );

  insertPolicy.run(
    uuidv4(),
    egyptOpId,
    'Automation Approval Required',
    'automation',
    'automation_approval_required',
    JSON.stringify({ enabled: true, minApprovers: 1 }),
    'enforced',
    'active',
    egyptAdminId
  );

  insertPolicy.run(
    uuidv4(),
    saudiOpId,
    'Export Limit',
    'data',
    'daily_export_limit',
    JSON.stringify({ limit: 10, unit: 'per_day' }),
    'enforced',
    'active',
    saudiAdminId
  );

  // --- GLOBAL SECURITY CONTROLS ---
  insertGlobalControl.run(
    uuidv4(),
    'automation_kill_switch',
    'Global automation kill switch - disables all automations system-wide',
    0,
    'All automations stopped',
    '30 minutes',
    1,
    'platform_admin'
  );

  insertGlobalControl.run(
    uuidv4(),
    'export_freeze',
    'Global export freeze - prevents all data exports',
    0,
    'All exports blocked',
    '15 minutes',
    1,
    'platform_admin'
  );

  insertGlobalControl.run(
    uuidv4(),
    'emergency_read_only',
    'Emergency read-only mode - all writes disabled',
    0,
    'System is read-only',
    '1 hour',
    1,
    'platform_admin'
  );

  // --- MODULE ACCESS CONTROL ---
  const modules = [
    { code: 'dashboard', name: 'Dashboard' },
    { code: 'topology', name: 'Topology' },
    { code: 'reports', name: 'Reports' },
    { code: 'automation', name: 'Automation & AI' },
    { code: 'alarms', name: 'Alarm Management' },
    { code: 'command', name: 'Command Center' },
    { code: 'analytics', name: 'Analytics' },
    { code: 'access', name: 'Access Control' },
    { code: 'audit', name: 'Activity & Audit' },
    { code: 'settings', name: 'Settings' },
  ];

  for (const module of modules) {
    insertModuleAccess.run(
      uuidv4(),
      egyptOpId,
      module.code,
      module.name,
      1,
      'read-only'
    );
  }

  console.log('✓ Database seeded with initial data');
}
