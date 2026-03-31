# Access Control & Tenant Management Module - Complete Rebuild Plan

## Executive Summary

The current Access Control page is a UI prototype with hardcoded mock data. This plan rebuilds it into a **production-ready, backend-driven, permission-aware system** that fully implements the OSS-Level Master Specification for multi-tenant governance, identity control, and zero-trust security.

---

## Phase 1: Architecture & Data Model Design

### 1.1 Overall Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                 │
│  ┌──────────────┬──────────────┬──────────────────────┐
│  │ Tenant Mgmt  │ User Mgmt    │ Role & Permission   │
│  │ UI           │ UI           │ Matrix UI           │
│  └──────────────┴──────────────┴──────────────────────┘
│                      ↓
│  ┌──────────────────────────────────────────────────┐
│  │ Auth Context + Tenant Context                   │
│  │ (Stores: current user, current tenant,          │
│  │  available tenants, user roles, permissions)    │
│  └──────────────────────────────────────────────────┘
│                      ↓
├─────────────────────────────────────────────────────────┤
│  API Gateway + Permission Evaluation Middleware        │
├─────────────────────────────────────────────────────────┤
│                  Express Backend                       │
│  ┌─────────────────────────────────────────────────┐
│  │ Routes:                                         │
│  │ • /api/tenants/* (CRUD, hierarchy)            │
│  │ • /api/users/* (CRUD, assignments)            │
│  │ • /api/roles/* (CRUD, permissions)            │
│  │ • /api/permissions/* (matrix, evaluation)      │
│  │ • /api/policies/* (inheritance, validation)    │
│  │ • /api/access-grants/* (cross-tenant)          │
│  │ • /api/elevation-requests/* (JIT access)       │
│  │ • /api/audit-logs/* (read-only)                │
│  │ • /api/security-controls/* (global)            │
│  └─────────────────────────────────────────────────┘
│                      ↓
│  ┌─────────────────────────────────────────────────┐
│  │ Service Layer:                                  │
│  │ • PermissionEvaluationService                  │
│  │ • TenantIsolationService                       │
│  │ • AuditLoggingService                          │
│  │ • ComplianceService                            │
│  │ • SeparationOfDutiesService                    │
│  └─────────────────────────────────────────────────┘
│                      ↓
├─────────────────────────────────────────────────────────┤
│                    Database Layer                       │
│  ┌─────────────────────────────────────────────────┐
│  │ Tables:                                         │
│  │ • tenants                                       │
│  │ • users                                         │
│  │ • user_tenant_memberships                      │
│  │ • roles                                         │
│  │ • role_permissions                             │
│  │ • permissions                                   │
│  │ • scoped_permissions                           │
│  │ • tenant_policies                              │
│  │ • access_grants (cross-tenant)                 │
│  │ • elevation_requests                           │
│  │ • audit_logs                                   │
│  │ • global_security_controls                     │
│  │ • compliance_rules                             │
│  └─────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

### 1.2 Database Schema Design

#### Core Tables

**`tenants`**
```sql
- id: UUID PRIMARY KEY
- name: VARCHAR(255) UNIQUE NOT NULL
- slug: VARCHAR(255) UNIQUE NOT NULL
- parent_id: UUID FK (null for root tenants)
- type: ENUM('parent', 'child') DEFAULT 'child'
- status: ENUM('active', 'suspended', 'archived') DEFAULT 'active'
- country: VARCHAR(100)
- timezone: VARCHAR(50)
- organization_type: VARCHAR(100)
- data_retention_days: INT DEFAULT 365
- security_level: ENUM('basic', 'standard', 'enhanced', 'critical') DEFAULT 'standard'
- branding_logo_url: TEXT nullable
- allowed_email_domains: TEXT[] nullable (JSON array)
- ip_allowlist: TEXT[] nullable
- regulatory_profile: TEXT nullable
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- created_by: UUID FK to users
- metadata: JSONB for future extensibility
```

**`users`**
```sql
- id: UUID PRIMARY KEY
- email: VARCHAR(255) UNIQUE NOT NULL
- name: VARCHAR(255) NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- status: ENUM('active', 'inactive', 'pending') DEFAULT 'pending'
- mfa_enabled: BOOLEAN DEFAULT false
- mfa_secret: VARCHAR(255) nullable
- last_login: TIMESTAMP nullable
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- metadata: JSONB
```

**`user_tenant_memberships`**
```sql
- id: UUID PRIMARY KEY
- user_id: UUID FK NOT NULL
- tenant_id: UUID FK NOT NULL
- role_id: UUID FK NOT NULL
- status: ENUM('active', 'inactive', 'pending') DEFAULT 'active'
- assigned_at: TIMESTAMP DEFAULT NOW()
- assigned_by: UUID FK to users
- created_at: TIMESTAMP DEFAULT NOW()
- UNIQUE(user_id, tenant_id)
```

**`roles`**
```sql
- id: UUID PRIMARY KEY
- tenant_id: UUID FK NOT NULL
- name: VARCHAR(255) NOT NULL
- type: ENUM('system', 'custom') DEFAULT 'custom'
- description: TEXT nullable
- status: ENUM('active', 'inactive') DEFAULT 'active'
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- created_by: UUID FK to users
- UNIQUE(tenant_id, name)
```

**`permissions`**
```sql
- id: UUID PRIMARY KEY
- code: VARCHAR(255) UNIQUE NOT NULL (e.g., 'topology.view', 'reports.execute')
- module: VARCHAR(100) NOT NULL (Dashboard, Analytics, Alarm, etc.)
- page: VARCHAR(100) nullable (specific page within module)
- feature: VARCHAR(100) nullable (specific feature)
- entity_type: VARCHAR(100) nullable (Site, Node, Cell, etc.)
- operation: ENUM('create', 'read', 'edit', 'delete', 'execute', 'approve', 'export', 'schedule') NOT NULL
- description: TEXT
- category: VARCHAR(100)
- risk_level: ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium'
- requires_approval: BOOLEAN DEFAULT false
- requires_mfa: BOOLEAN DEFAULT false
- created_at: TIMESTAMP DEFAULT NOW()
```

**`role_permissions`**
```sql
- id: UUID PRIMARY KEY
- role_id: UUID FK NOT NULL
- permission_id: UUID FK NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()
- created_by: UUID FK to users
- UNIQUE(role_id, permission_id)
```

**`scoped_permissions`**
```sql
- id: UUID PRIMARY KEY
- permission_id: UUID FK NOT NULL
- role_id: UUID FK NOT NULL
- user_id: UUID FK nullable (if user-level override)
- scope_type: ENUM('region', 'vendor', 'technology', 'cluster', 'object_type') NOT NULL
- scope_value: VARCHAR(255) NOT NULL (e.g., 'region: EMEA', 'vendor: Ericsson')
- created_at: TIMESTAMP DEFAULT NOW()
```

**`tenant_policies`**
```sql
- id: UUID PRIMARY KEY
- tenant_id: UUID FK NOT NULL
- parent_tenant_id: UUID FK nullable (if policy inherited)
- name: VARCHAR(255) NOT NULL
- category: VARCHAR(100) NOT NULL (e.g., 'authentication', 'automation', 'export')
- policy_key: VARCHAR(255) (e.g., 'mfa_required', 'automation_approval_required')
- policy_value: JSONB (flexible config)
- level: ENUM('enforced', 'overridable', 'inherited') DEFAULT 'enforced'
- applies_to_children: BOOLEAN DEFAULT false
- status: ENUM('active', 'inactive') DEFAULT 'active'
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- created_by: UUID FK to users
```

**`access_grants`** (cross-tenant)
```sql
- id: UUID PRIMARY KEY
- granted_to_user_id: UUID FK NOT NULL
- granted_to_tenant_id: UUID FK NOT NULL
- granted_from_tenant_id: UUID FK NOT NULL
- mode: ENUM('read-only', 'operational') NOT NULL
- approved_by_user_id: UUID FK NOT NULL
- reason: TEXT NOT NULL
- expires_at: TIMESTAMP NOT NULL
- status: ENUM('active', 'expired', 'revoked') DEFAULT 'active'
- created_at: TIMESTAMP DEFAULT NOW()
- revoked_at: TIMESTAMP nullable
- revoked_by_user_id: UUID FK nullable
```

**`elevation_requests`** (Just-In-Time Access)
```sql
- id: UUID PRIMARY KEY
- user_id: UUID FK NOT NULL
- tenant_id: UUID FK NOT NULL
- requested_role_id: UUID FK NOT NULL
- current_role_id: UUID FK NOT NULL
- reason: TEXT NOT NULL
- duration_hours: INT NOT NULL
- status: ENUM('pending', 'approved', 'rejected', 'active', 'expired') DEFAULT 'pending'
- requested_at: TIMESTAMP DEFAULT NOW()
- approved_at: TIMESTAMP nullable
- approved_by_user_id: UUID FK nullable
- expires_at: TIMESTAMP nullable
- created_at: TIMESTAMP DEFAULT NOW()
```

**`audit_logs`**
```sql
- id: UUID PRIMARY KEY
- user_id: UUID FK NOT NULL
- tenant_id: UUID FK NOT NULL
- action: VARCHAR(255) NOT NULL (e.g., 'user.created', 'permission.denied', 'role.modified')
- resource_type: VARCHAR(100) NOT NULL
- resource_id: VARCHAR(255) NOT NULL
- status: ENUM('success', 'denied', 'error') DEFAULT 'success'
- status_reason: TEXT nullable (why access was denied)
- module: VARCHAR(100)
- operation: VARCHAR(100)
- ip_address: VARCHAR(45)
- user_agent: TEXT
- metadata: JSONB
- timestamp: TIMESTAMP DEFAULT NOW()
- created_at: TIMESTAMP DEFAULT NOW()
- INDEX(user_id, tenant_id, timestamp DESC)
- INDEX(action, timestamp DESC)
- INDEX(status, timestamp DESC)
```

**`global_security_controls`**
```sql
- id: UUID PRIMARY KEY
- name: VARCHAR(255) UNIQUE NOT NULL (e.g., 'automation_kill_switch', 'export_freeze')
- description: TEXT
- is_enabled: BOOLEAN DEFAULT false
- impact: VARCHAR(100)
- recovery_time: VARCHAR(100)
- requires_approval: BOOLEAN DEFAULT true
- approval_level: VARCHAR(100) (e.g., 'platform_admin')
- triggered_at: TIMESTAMP nullable
- triggered_by_user_id: UUID FK nullable
- last_updated_at: TIMESTAMP DEFAULT NOW()
- last_updated_by_user_id: UUID FK nullable
```

**`compliance_rules`** (Separation of Duties)
```sql
- id: UUID PRIMARY KEY
- tenant_id: UUID FK NOT NULL
- name: VARCHAR(255) NOT NULL
- category: VARCHAR(100)
- description: TEXT
- rule_type: VARCHAR(100) (e.g., 'prevent_combination')
- prevents: JSONB (e.g., { operations: ['create_automation', 'approve_automation'] })
- severity: ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium'
- enforcement: ENUM('prevent', 'warn', 'audit') DEFAULT 'prevent'
- status: ENUM('active', 'inactive') DEFAULT 'active'
- created_at: TIMESTAMP DEFAULT NOW()
- created_by: UUID FK to users
```

---

## Phase 2: Backend API Design

### 2.1 Core API Endpoints

#### Tenant Management
```
POST   /api/tenants                    - Create tenant
GET    /api/tenants                    - List tenants (with filters)
GET    /api/tenants/:id                - Get tenant details
PUT    /api/tenants/:id                - Update tenant
DELETE /api/tenants/:id                - Delete/archive tenant
GET    /api/tenants/:id/hierarchy      - Get parent and children
GET    /api/tenants/:id/policies       - Get tenant policies
GET    /api/tenants/:id/users          - List users in tenant
GET    /api/tenants/:id/roles          - List roles in tenant
```

#### User Management
```
POST   /api/users                      - Create user
GET    /api/users                      - List all users
GET    /api/users/:id                  - Get user details
PUT    /api/users/:id                  - Update user
DELETE /api/users/:id                  - Delete/deactivate user
GET    /api/users/:id/tenants          - Get user's tenant memberships
POST   /api/users/:id/tenants/:tenantId/assign  - Assign user to tenant with role
DELETE /api/users/:id/tenants/:tenantId         - Remove user from tenant
POST   /api/users/:id/mfa/enable       - Enable MFA
POST   /api/users/:id/mfa/disable      - Disable MFA
```

#### Role Management
```
POST   /api/tenants/:tenantId/roles    - Create role
GET    /api/tenants/:tenantId/roles    - List roles
GET    /api/tenants/:tenantId/roles/:id           - Get role details
PUT    /api/tenants/:tenantId/roles/:id           - Update role
DELETE /api/tenants/:tenantId/roles/:id           - Delete role
POST   /api/tenants/:tenantId/roles/:id/permissions - Add permission to role
DELETE /api/tenants/:tenantId/roles/:id/permissions/:permId - Remove permission
```

#### Permission Management
```
GET    /api/permissions                - List all available permissions
GET    /api/permissions/:id            - Get permission details
GET    /api/tenants/:tenantId/permissions - Get permissions available in tenant
GET    /api/users/:userId/tenants/:tenantId/permissions - Get user's actual permissions
POST   /api/permission-matrix          - Evaluate permission matrix for role
POST   /api/permission-evaluation      - Evaluate permission for specific action
```

#### Scoped Permissions
```
POST   /api/tenants/:tenantId/scoped-permissions           - Create scoped permission
GET    /api/tenants/:tenantId/scoped-permissions           - List scoped permissions
DELETE /api/tenants/:tenantId/scoped-permissions/:id        - Remove scoped permission
PUT    /api/tenants/:tenantId/scoped-permissions/:id        - Update scope
```

#### Tenant Policies
```
POST   /api/tenants/:tenantId/policies          - Create policy
GET    /api/tenants/:tenantId/policies          - List policies
PUT    /api/tenants/:tenantId/policies/:id      - Update policy
DELETE /api/tenants/:tenantId/policies/:id      - Delete policy
GET    /api/tenants/:tenantId/policies/inherited - Get inherited policies
```

#### Cross-Tenant Access
```
POST   /api/access-grants                       - Create cross-tenant access grant
GET    /api/access-grants                       - List grants
GET    /api/access-grants/:id                   - Get grant details
PUT    /api/access-grants/:id                   - Update grant
DELETE /api/access-grants/:id                   - Revoke grant
```

#### Privilege Elevation (JIT Access)
```
POST   /api/elevation-requests                  - Request temporary elevation
GET    /api/elevation-requests                  - List requests
GET    /api/elevation-requests/:id              - Get request details
POST   /api/elevation-requests/:id/approve      - Approve request
POST   /api/elevation-requests/:id/reject       - Reject request
POST   /api/elevation-requests/:id/revoke       - Revoke active elevation
```

#### Audit & Compliance
```
GET    /api/audit-logs                         - List audit logs
GET    /api/audit-logs/:id                     - Get audit entry
GET    /api/audit-logs/user/:userId            - Get logs for user
GET    /api/audit-logs/resource/:type/:id      - Get logs for resource
POST   /api/compliance-rules                   - Create compliance rule
GET    /api/compliance-rules                   - List rules
PUT    /api/compliance-rules/:id               - Update rule
DELETE /api/compliance-rules/:id               - Delete rule
POST   /api/compliance-check                   - Check if action violates rules
```

#### Global Security Controls
```
GET    /api/security-controls                  - List all controls
GET    /api/security-controls/:id              - Get control status
POST   /api/security-controls/:id/enable       - Enable control
POST   /api/security-controls/:id/disable      - Disable control
GET    /api/security-controls/:id/status       - Check if control is active
```

### 2.2 Request/Response Patterns

All responses follow a standard envelope:
```typescript
{
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
```

All requests include headers:
```
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
X-Request-ID: {uniqueId}
```

---

## Phase 3: Permission Evaluation Engine

### 3.1 Core Algorithm

Every action follows this 3-step evaluation:

```typescript
function evaluatePermission(
  user: User,
  tenant: Tenant,
  action: PermissionAction
): PermissionResult {
  
  // Step 1: Verify tenant access
  if (!userHasAccessToTenant(user, tenant)) {
    return deny("USER_NOT_MEMBER_OF_TENANT");
  }

  // Step 2: Check role-based permission
  const userRole = getUserRoleInTenant(user, tenant);
  if (!roleHasPermission(userRole, action.permissionCode)) {
    return deny("PERMISSION_DENIED_BY_ROLE");
  }

  // Step 3: Check tenant policies
  const policies = getTenantPolicies(tenant);
  const policyValidation = validateAgainstPolicies(
    user, action, policies
  );
  if (!policyValidation.allowed) {
    return deny(`POLICY_VIOLATION: ${policyValidation.reason}`);
  }

  // Step 4: Check scoped permissions
  if (action.scope) {
    if (!userHasScopedPermission(user, tenant, action)) {
      return deny("SCOPED_PERMISSION_DENIED");
    }
  }

  // Step 5: Check separation of duties
  if (action.requires_separation_check) {
    const violation = checkSeparationOfDuties(user, action);
    if (violation) {
      return deny(`SEPARATION_OF_DUTIES_VIOLATION: ${violation}`);
    }
  }

  // Step 6: Check global controls
  if (isGlobalControlActive(action.controlType)) {
    return deny(`GLOBAL_CONTROL_ACTIVE: ${action.controlType}`);
  }

  // Log successful evaluation
  logAuditEvent({
    user, tenant, action, status: 'success'
  });

  return allow();
}
```

### 3.2 Module-Level Access Control

For each module (Dashboard, Reports, Automation, etc.):

```typescript
interface ModuleAccess {
  moduleCode: string;
  accessLevel: 'no-access' | 'read-only' | 'full-access' | 'custom';
  pages?: PageAccess[];
  features?: FeatureAccess[];
}

// In tenant-level policy
can_access_module(module, accessLevel) → determines what shows in UI
```

### 3.3 Operation-Level Control

For each operation (Create, Read, Edit, Delete, Execute, etc.):

```typescript
const operations = {
  CREATE: { code: 'create', risk: 'medium' },
  READ: { code: 'read', risk: 'low' },
  EDIT: { code: 'edit', risk: 'medium' },
  DELETE: { code: 'delete', risk: 'high' },
  EXECUTE: { code: 'execute', risk: 'high' },
  APPROVE: { code: 'approve', risk: 'critical' },
  EXPORT: { code: 'export', risk: 'medium' },
  SCHEDULE: { code: 'schedule', risk: 'medium' }
};

// Checked at API gateway before endpoint execution
```

---

## Phase 4: Audit & Compliance

### 4.1 Audit Logging Strategy

Every denied action is logged:
```
user: "john@company.com"
tenant: "Egypt Operations"
module: "Command Center"
operation: "execute_script"
status: "denied"
reason: "GLOBAL_CONTROL_ACTIVE: automation_kill_switch"
timestamp: 2024-01-15T10:30:00Z
metadata: { scriptId: "xyz", targetDevices: 5 }
```

### 4.2 Compliance Rules Engine

Prevents dangerous combinations:
```typescript
// Example: User cannot create AND approve own automation
if (user.canPerform('automation.create') && 
    user.canPerform('automation.approve')) {
  logComplianceWarning(user, 'separation_of_duties_violation');
}
```

---

## Phase 5: Frontend Architecture

### 5.1 New File Structure

```
client/
├── pages/
│   └── AccessControl.tsx          (Main page - refactored)
├── components/
│   ├── access-control/
│   │   ├── TenantGovernance/      (Parent/child hierarchy)
│   │   ├── TenantManagement/      (Create, update, delete)
│   │   ├── UserManagement/        (Assign users to tenants)
│   │   ├── RoleManagement/        (Create and manage roles)
│   │   ├── PermissionMatrix/      (Module/page/operation control)
│   │   ├── PolicyManagement/      (Tenant policies and inheritance)
│   │   ├── CrossTenantAccess/     (Multi-tenant access grants)
│   │   ├── PrivilegeElevation/    (JIT access requests)
│   │   ├── ComplianceRules/       (Separation of duties)
│   │   ├── SecurityControls/      (Global kill switches)
│   │   ├── AuditLogs/             (Read-only audit view)
│   │   └── TenantSwitcher/        (Quick tenant selection)
│   ├── tenant-context/
│   │   └── TenantProvider.tsx      (Tenant context provider)
│   └── permission-guard/
│       └── PermissionGate.tsx      (Component-level permission gating)
├── contexts/
│   ├── AuthContext.tsx            (Enhanced with tenant awareness)
│   └── TenantContext.tsx           (New - manages current tenant)
├── hooks/
│   ├── useTenantContext.ts         (Access tenant context)
│   ├── usePermission.ts            (Check permissions)
│   ├── useTenants.ts               (Fetch and manage tenants)
│   ├── useUsers.ts                 (User CRUD operations)
│   ├── useRoles.ts                 (Role management)
│   └── useAuditLogs.ts             (Fetch audit logs)
└── utils/
    └── permission-helpers.ts        (Permission evaluation utilities)
```

### 5.2 Key Components

#### `PermissionGate.tsx`
Wraps components and hides them if user lacks permission:
```typescript
<PermissionGate permission="topology.edit" fallback={<Locked />}>
  <TopologyEditor />
</PermissionGate>
```

#### `TenantSwitcher.tsx`
Shows available tenants with current role and environment:
- Tenant name
- User's role in that tenant
- Environment (Prod/Staging/Lab)
- Switch button (intentional, never automatic)

#### `PermissionMatrix.tsx`
Visual grid showing:
- Rows: Roles
- Columns: Modules (Dashboard, Reports, Automation, etc.)
- Cells: Access levels (None, Read-Only, Full, Custom)
- Allow drag-to-update for admins

#### `AuditLogs.tsx`
Read-only log viewer with:
- Filters: User, Tenant, Module, Status, Date Range
- Search: User, Resource, Action
- Export: CSV
- Real-time refresh

---

## Phase 6: Migration & Deletion Plan

### 6.1 Files to Delete

All current mockup files:
```
client/components/access-control/*
client/pages/AccessControl.tsx
client/utils/mock-access-control-data.ts (if exists)
```

### 6.2 Files to Create/Modify

**Database**: SQLite (file-based, no external dependencies)
- Database file: `database.sqlite` (will be created automatically)
- Location: Project root (added to .gitignore)

Backend:
```
server/
├── db/
│   ├── initialize.ts              (SQLite setup and migrations)
│   └── schema.sql                 (SQLite DDL)
├── services/
│   ├── PermissionEvaluationService.ts
│   ├── TenantService.ts
│   ├── UserService.ts
│   ├── RoleService.ts
│   ├── AuditService.ts
│   ├── ComplianceService.ts
│   └── SeparationOfDutiesService.ts
├── middleware/
│   ├── authorization.ts
│   ├── auditLogging.ts
│   └── tenantValidation.ts
├── routes/
│   ├── tenants.ts
│   ├── users.ts
│   ├── roles.ts
│   ├── permissions.ts
│   ├── policies.ts
│   ├── access-grants.ts
│   ├── elevation-requests.ts
│   ├── audit-logs.ts
│   ├── compliance-rules.ts
│   └── security-controls.ts
└── types/
    └── access-control.ts          (TypeScript interfaces)
```

Frontend:
```
client/
├── pages/AccessControl.tsx (new)
├── components/access-control/ (new structure)
├── contexts/TenantContext.tsx (new)
├── hooks/usePermission.ts, useTenants.ts, etc.
└── utils/permission-helpers.ts
```

---

## Phase 7: Implementation Sequence

### Step 1: Setup Database (1-2 hours)
- Create schema from section 1.2
- Add seed data for testing
- Set up migrations framework

### Step 2: Build Backend Services (4-5 hours)
- PermissionEvaluationService
- TenantService
- UserService
- RoleService
- AuditService

### Step 3: Build API Endpoints (3-4 hours)
- Tenant management endpoints
- User management endpoints
- Role management endpoints
- Permission matrix endpoints

### Step 4: Add Middleware (2-3 hours)
- Authorization middleware
- Audit logging middleware
- Tenant validation middleware

### Step 5: Build Frontend Context (2-3 hours)
- TenantContext
- Enhanced AuthContext
- Permission hooks

### Step 6: Build Main Access Control UI (5-6 hours)
- Delete old page
- Rebuild with new architecture
- Rebuild each subcomponent

### Step 7: Integration & Testing (3-4 hours)
- End-to-end testing
- Permission evaluation testing
- Audit logging verification

---

## Key Design Decisions

1. **Tenant Isolation**: All queries scoped by tenant_id. No shared resources.
2. **Permission Model**: Additive (explicit grant required). Never deny-by-default except when tenant access fails.
3. **Audit First**: Every significant action logged immediately, even on error.
4. **Backend Validation**: Frontend enforcement is UX, backend is security.
5. **Separation of Duties**: Checked at authorization layer, prevents high-risk combinations.
6. **Scoped Permissions**: Allow fine-grained control (e.g., "edit only Ericsson cells in EMEA").
7. **Policy Inheritance**: Child tenants inherit parent policies but can override if allowed.
8. **Global Controls**: Emergency switches for automation, export, read-only mode.

---

## Success Criteria

- [ ] All 3 layers of permission checks working (tenant + role + policy)
- [ ] Tenant hierarchy (parent/child) fully functional
- [ ] Cross-tenant access grants working with time limits
- [ ] JIT access requests with approval flow
- [ ] Audit logs capturing all denied actions
- [ ] Module/page/operation access matrix functional
- [ ] Separation of duties preventing dangerous combinations
- [ ] Scoped permissions (region, vendor, technology) working
- [ ] Global security controls toggleable
- [ ] UI visually consistent with rest of platform
- [ ] All API endpoints secured and tenant-aware
- [ ] Frontend shows/hides UI based on permissions
- [ ] Backend rejects unauthorized requests

---

## Estimated Timeline

**Phased Approach with SQLite: 20-25 hours of focused development**

- Database setup: 1 hour (SQLite is very fast to initialize)
- Backend services: 4-5 hours
- API endpoints: 3-4 hours
- Middleware: 2-3 hours
- Frontend context: 2-3 hours
- Frontend UI rebuild: 5-6 hours
- Integration & testing: 2-3 hours
- Buffer: 2-3 hours

**Phased Benefits:**
1. Build DB → can test schema immediately
2. Build services → can validate permission logic in isolation
3. Build API → can test with curl/Postman before frontend
4. Build frontend → hooks into real API, not mocks

**SQLite Benefits:**
- No external DB server needed
- File-based persistence (simple)
- Fast enough for testing and small deployments
- Easy to backup (just copy the file)
- Included in Node.js ecosystem via `better-sqlite3`

---

## CONFIRMED APPROACH

✅ **Database**: SQLite (file-based)
✅ **Approach**: Phased (DB → Services → API → Frontend)
✅ **Page Deletion**: Complete rebuild from scratch
✅ **Visual Style**: Keep consistent with existing platform (Tailwind + Radix)

---

## Ready to Begin

We are ready to start **Phase 1: Database Schema & Setup**

When you're ready, I will:
1. Set up SQLite database initialization
2. Create complete schema (all 13 tables from section 1.2)
3. Create seed data for testing
4. Verify database works
5. Move to Phase 2: Backend Services
