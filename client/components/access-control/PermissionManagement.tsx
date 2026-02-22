import { Key, Grid3x3, Shield, Edit } from 'lucide-react';
import { useState } from 'react';

interface PermissionCategory {
  category: string;
  description: string;
  permissions: Array<{ name: string; description: string }>;
}

export default function PermissionManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>('dashboard');

  const permissionCategories: PermissionCategory[] = [
    {
      category: 'Dashboard',
      description: 'Dashboard access and customization',
      permissions: [
        { name: 'view_dashboard', description: 'View dashboards' },
        { name: 'create_dashboard', description: 'Create new dashboards' },
        { name: 'edit_dashboard', description: 'Modify dashboard layouts' },
        { name: 'share_dashboard', description: 'Share dashboards with other users' },
        { name: 'delete_dashboard', description: 'Delete dashboards' }
      ]
    },
    {
      category: 'Reports',
      description: 'Report generation and management',
      permissions: [
        { name: 'view_reports', description: 'View existing reports' },
        { name: 'create_report', description: 'Generate new reports' },
        { name: 'schedule_report', description: 'Schedule automated reports' },
        { name: 'export_report', description: 'Export reports to files' },
        { name: 'delete_report', description: 'Delete reports' }
      ]
    },
    {
      category: 'Automation',
      description: 'Automation execution and management',
      permissions: [
        { name: 'view_automation', description: 'View automation rules' },
        { name: 'execute_automation', description: 'Execute automations' },
        { name: 'create_automation', description: 'Create automation rules' },
        { name: 'approve_automation', description: 'Approve automation changes' },
        { name: 'manage_automation', description: 'Manage all automations' }
      ]
    },
    {
      category: 'Configuration',
      description: 'System configuration and parameters',
      permissions: [
        { name: 'view_config', description: 'View system configuration' },
        { name: 'modify_config', description: 'Modify configuration parameters' },
        { name: 'change_control', description: 'Require change approval' },
        { name: 'restore_config', description: 'Restore configuration backups' }
      ]
    },
    {
      category: 'Users & Roles',
      description: 'User and role management',
      permissions: [
        { name: 'view_users', description: 'View user list' },
        { name: 'create_user', description: 'Create new users' },
        { name: 'edit_user', description: 'Modify user accounts' },
        { name: 'manage_roles', description: 'Manage role definitions' },
        { name: 'manage_permissions', description: 'Manage permissions' }
      ]
    },
    {
      category: 'Audit & Compliance',
      description: 'Audit trail and compliance monitoring',
      permissions: [
        { name: 'view_audit_logs', description: 'View audit logs' },
        { name: 'export_audit_logs', description: 'Export audit data' },
        { name: 'manage_audit_policy', description: 'Configure audit policies' },
        { name: 'view_compliance', description: 'View compliance status' }
      ]
    }
  ];

  const currentCategory = permissionCategories.find(c => c.category.toLowerCase() === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Key className="w-5 h-5 text-red-600" />
          Fine-Grained Permission Control
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage granular permissions across the platform. Each role is assigned specific capabilities with support for conditional access.
        </p>
      </div>

      {/* Permission Categories */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Grid3x3 className="w-4 h-4" />
          Permission Categories
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {permissionCategories.map(cat => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category.toLowerCase())}
              className={`p-4 rounded-lg border transition-colors text-left ${
                selectedCategory === cat.category.toLowerCase()
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 hover:border-border bg-card/50'
              }`}
            >
              <h4 className={`font-bold mb-1 ${selectedCategory === cat.category.toLowerCase() ? 'text-primary' : 'text-foreground'}`}>
                {cat.category}
              </h4>
              <p className="text-xs text-muted-foreground">{cat.permissions.length} permissions</p>
              <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Category Permissions */}
      {currentCategory && (
        <div className="rounded-xl border border-border/50 p-6 bg-card/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">{currentCategory.category} Permissions</h3>
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-semibold">
              {currentCategory.permissions.length} perms
            </span>
          </div>

          <div className="space-y-2">
            {currentCategory.permissions.map((perm, idx) => (
              <div key={idx} className="p-4 bg-muted/30 border border-border/30 rounded-lg hover:border-border transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold text-foreground">{perm.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{perm.description}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center gap-1">
                    <Edit className="w-3 h-3" />
                    Grant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Matrix */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Role-Permission Matrix (Sample)</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border/30">
              <tr>
                <th className="text-left py-2 px-3 font-bold text-muted-foreground">Permission</th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">Admin</th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">Manager</th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">Operator</th>
                <th className="text-center py-2 px-3 font-bold text-muted-foreground">Viewer</th>
              </tr>
            </thead>
            <tbody>
              {['View Dashboard', 'Create Dashboard', 'Execute Automation', 'Modify Config', 'Manage Users', 'View Audit Logs'].map((perm, idx) => (
                <tr key={idx} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-2 px-3 text-foreground">{perm}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {idx < 4 ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {idx < 2 ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {idx === 0 ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditional Access */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Conditional Access Policies
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="font-bold text-blue-700 text-sm mb-2">Time-Based Access</p>
            <p className="text-xs text-blue-600">
              Restrict specific actions to business hours or maintenance windows.
            </p>
          </div>
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="font-bold text-purple-700 text-sm mb-2">IP-Based Restrictions</p>
            <p className="text-xs text-purple-600">
              Limit access to whitelisted IP addresses for sensitive operations.
            </p>
          </div>
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-2">Risk-Based Access</p>
            <p className="text-xs text-green-600">
              Require MFA or approval for high-risk operations based on user behavior.
            </p>
          </div>
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="font-bold text-orange-700 text-sm mb-2">Approval Workflows</p>
            <p className="text-xs text-orange-600">
              Certain permissions require explicit approval before execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
