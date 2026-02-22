import { Shield, Plus, Edit, Copy, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Role {
  id: string;
  name: string;
  type: 'system' | 'custom';
  description: string;
  permissions: number;
  usersCount: number;
  status: 'active' | 'deprecated';
  inherits?: string;
}

export default function RoleManagement() {
  const [expandedRole, setExpandedRole] = useState<string>('role-1');

  const roles: Role[] = [
    {
      id: 'role-1',
      name: 'System Admin',
      type: 'system',
      description: 'Complete access to all systems and features',
      permissions: 156,
      usersCount: 12,
      status: 'active'
    },
    {
      id: 'role-2',
      name: 'Operations Manager',
      type: 'system',
      description: 'Manage NOC operations and execute automation',
      permissions: 87,
      usersCount: 34,
      status: 'active'
    },
    {
      id: 'role-3',
      name: 'Operator',
      type: 'system',
      description: 'Monitor and respond to alarms and events',
      permissions: 42,
      usersCount: 156,
      status: 'active'
    },
    {
      id: 'role-4',
      name: 'Viewer',
      type: 'system',
      description: 'Read-only access to dashboards and reports',
      permissions: 18,
      usersCount: 89,
      status: 'active'
    },
    {
      id: 'role-5',
      name: 'RF Engineer',
      type: 'custom',
      description: 'Radio frequency configuration and optimization',
      permissions: 64,
      usersCount: 23,
      status: 'active',
      inherits: 'Operator'
    },
    {
      id: 'role-6',
      name: 'Auditor',
      type: 'system',
      description: 'Audit trail review and compliance monitoring',
      permissions: 28,
      usersCount: 6,
      status: 'active'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          Role Management & Hierarchy
        </h3>
        <p className="text-sm text-muted-foreground">
          Define roles with fine-grained permissions. Roles can inherit from other roles. Built-in system roles provide standard access patterns.
        </p>
      </div>

      {/* Role Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <h4 className="font-bold text-blue-700 mb-2">System Roles (Built-in)</h4>
          <p className="text-sm text-blue-600">
            Pre-configured roles maintained by platform. Cannot be modified or deleted. Include: Admin, Manager, Operator, Viewer, Auditor.
          </p>
        </div>
        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
          <h4 className="font-bold text-purple-700 mb-2">Custom Roles</h4>
          <p className="text-sm text-purple-600">
            Organization-specific roles created for specialized access patterns. Can inherit from system roles for base permissions.
          </p>
        </div>
      </div>

      {/* Roles Directory */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Roles Directory</h3>
          <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>

        <div className="space-y-3">
          {roles.map(role => {
            const isExpanded = expandedRole === role.id;
            return (
              <div key={role.id} className="rounded-lg border border-border/50 p-4 hover:border-border transition-colors">
                <div
                  onClick={() => setExpandedRole(isExpanded ? '' : role.id)}
                  className="cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{role.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        role.type === 'system' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {role.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{role.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                        {role.permissions} permissions
                      </span>
                      <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                        {role.usersCount} users assigned
                      </span>
                      {role.inherits && (
                        <span className="text-xs bg-purple-500/20 text-purple-700 px-2 py-1 rounded">
                          Inherits: {role.inherits}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Capability Summary</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['View Dashboards', 'View Reports', 'Execute Commands', 'Manage Automation', 'Modify Config', 'Manage Users', 'View Audit Logs', 'Export Data', 'Approve Changes'].slice(0, role.permissions < 50 ? 3 : 6).map((perm, idx) => (
                          <div key={idx} className="text-xs p-2 bg-muted/30 rounded text-muted-foreground">
                            ✓ {perm}
                          </div>
                        ))}
                        <div className="text-xs p-2 bg-muted/30 rounded text-muted-foreground col-span-2 md:col-span-1">
                          +{role.permissions - 6} more...
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border/30">
                      <button className="flex-1 px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center justify-center gap-1">
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      {role.type === 'custom' && (
                        <>
                          <button className="flex-1 px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center justify-center gap-1">
                            <Copy className="w-3 h-3" />
                            Duplicate
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Inheritance Hierarchy */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Role Hierarchy</h3>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-foreground">System Admin</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white">156 perms</span>
            </div>
            <p className="text-xs text-muted-foreground">Root role with all capabilities</p>
          </div>

          <div className="text-center text-muted-foreground">↓</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Operations Manager', perms: 87 },
              { name: 'Auditor', perms: 28 },
              { name: 'RF Engineer', perms: 64, inherits: true }
            ].map(role => (
              <div key={role.name} className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-foreground">{role.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-600 text-white">{role.perms} perms</span>
                </div>
                {role.inherits && (
                  <p className="text-xs text-blue-600">← Inherits from above</p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-muted-foreground">↓</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Operator', perms: 42 },
              { name: 'Viewer', perms: 18 }
            ].map(role => (
              <div key={role.name} className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-foreground">{role.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-600 text-white">{role.perms} perms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permission Model */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Permission Model
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="font-bold text-blue-700 text-sm mb-2">Role-Based Access Control (RBAC)</p>
            <p className="text-xs text-blue-600">
              Permissions are grouped by resource and action. Each role has a set of allowed actions.
            </p>
          </div>
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="font-bold text-purple-700 text-sm mb-2">Attribute-Based Access Control (ABAC)</p>
            <p className="text-xs text-purple-600">
              Advanced permission rules based on attributes like tenant, time window, source IP, and risk level.
            </p>
          </div>
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-2">Resource-Based Access Control (RBAC)</p>
            <p className="text-xs text-green-600">
              Objects (dashboards, reports, automations) can have explicit permission grants beyond role-based access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
