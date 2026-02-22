import { Grid3x3, Eye, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ModulePermission {
  name: string;
  level: 'no-access' | 'read-only' | 'full-access' | 'custom';
  pages?: string[];
  operations?: Record<string, boolean>;
}

interface RoleModuleMatrix {
  role: string;
  modules: Record<string, ModulePermission>;
}

export default function ModuleAccessMatrix() {
  const [selectedRole, setSelectedRole] = useState<string>('operator');
  const [expandedModule, setExpandedModule] = useState<string>('topology');

  const modules = [
    'Dashboard',
    'Analytics',
    'Alarm Management',
    'Automation & AI',
    'Topology',
    'Command Center',
    'Reports',
    'Activity & Audit',
    'Settings',
    'Access Control'
  ];

  const operations = ['Create', 'Read', 'Edit', 'Delete', 'Execute', 'Approve', 'Export', 'Schedule'];

  const roleMatrices: Record<string, RoleModuleMatrix> = {
    admin: {
      role: 'System Admin',
      modules: {
        'Dashboard': { level: 'full-access' },
        'Analytics': { level: 'full-access' },
        'Alarm Management': { level: 'full-access' },
        'Automation & AI': { level: 'full-access' },
        'Topology': { level: 'full-access' },
        'Command Center': { level: 'full-access' },
        'Reports': { level: 'full-access' },
        'Activity & Audit': { level: 'full-access' },
        'Settings': { level: 'full-access' },
        'Access Control': { level: 'full-access' }
      }
    },
    manager: {
      role: 'Operations Manager',
      modules: {
        'Dashboard': { level: 'full-access' },
        'Analytics': { level: 'full-access' },
        'Alarm Management': { level: 'full-access' },
        'Automation & AI': { level: 'full-access' },
        'Topology': { level: 'read-only' },
        'Command Center': { level: 'custom' },
        'Reports': { level: 'full-access' },
        'Activity & Audit': { level: 'read-only' },
        'Settings': { level: 'read-only' },
        'Access Control': { level: 'no-access' }
      }
    },
    operator: {
      role: 'Operator',
      modules: {
        'Dashboard': { level: 'read-only' },
        'Analytics': { level: 'read-only' },
        'Alarm Management': { level: 'custom' },
        'Automation & AI': { level: 'read-only' },
        'Topology': { level: 'read-only' },
        'Command Center': { level: 'read-only' },
        'Reports': { level: 'read-only' },
        'Activity & Audit': { level: 'read-only' },
        'Settings': { level: 'no-access' },
        'Access Control': { level: 'no-access' }
      }
    },
    viewer: {
      role: 'Viewer',
      modules: {
        'Dashboard': { level: 'read-only' },
        'Analytics': { level: 'read-only' },
        'Alarm Management': { level: 'read-only' },
        'Automation & AI': { level: 'no-access' },
        'Topology': { level: 'read-only' },
        'Command Center': { level: 'no-access' },
        'Reports': { level: 'read-only' },
        'Activity & Audit': { level: 'read-only' },
        'Settings': { level: 'no-access' },
        'Access Control': { level: 'no-access' }
      }
    }
  };

  const operationExamples: Record<string, Record<string, boolean>> = {
    'Alarm Management': {
      'Create': false,
      'Read': true,
      'Edit': false,
      'Delete': false,
      'Execute': false,
      'Approve': false,
      'Export': true,
      'Schedule': false
    },
    'Topology': {
      'Create': true,
      'Read': true,
      'Edit': true,
      'Delete': false,
      'Execute': false,
      'Approve': false,
      'Export': true,
      'Schedule': false
    },
    'Command Center': {
      'Create': false,
      'Read': true,
      'Edit': false,
      'Delete': false,
      'Execute': true,
      'Approve': true,
      'Export': false,
      'Schedule': false
    }
  };

  const currentMatrix = roleMatrices[selectedRole];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'full-access':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'read-only':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
      case 'custom':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-700';
      case 'no-access':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'full-access':
        return 'bg-green-600 text-white';
      case 'read-only':
        return 'bg-blue-600 text-white';
      case 'custom':
        return 'bg-purple-600 text-white';
      case 'no-access':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'full-access':
        return 'Complete access to all features';
      case 'read-only':
        return 'Can view but not modify';
      case 'custom':
        return 'Granular operation-level control';
      case 'no-access':
        return 'No access (hidden from UI)';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-indigo-600" />
          Module, Page & Operation Access Matrix
        </h3>
        <p className="text-sm text-muted-foreground">
          Define granular access control across modules, pages, and operations. Access can be controlled at multiple levels from module visibility to field-level permissions.
        </p>
      </div>

      {/* Access Levels */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Access Level Definitions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className={`p-4 rounded-lg border ${getLevelColor('full-access')}`}>
            <h4 className="font-bold text-green-700 text-sm mb-2">Full Access</h4>
            <p className="text-xs text-green-600 mb-2">Complete access to all features and operations</p>
            <p className="text-xs text-green-600">• Create, Edit, Delete all entities</p>
            <p className="text-xs text-green-600">• Execute and approve operations</p>
            <p className="text-xs text-green-600">• Export and schedule tasks</p>
          </div>

          <div className={`p-4 rounded-lg border ${getLevelColor('read-only')}`}>
            <h4 className="font-bold text-blue-700 text-sm mb-2">Read-Only</h4>
            <p className="text-xs text-blue-600 mb-2">Can view information but cannot modify</p>
            <p className="text-xs text-blue-600">• View dashboards and reports</p>
            <p className="text-xs text-blue-600">• View configuration details</p>
            <p className="text-xs text-blue-600">• Cannot execute changes or operations</p>
          </div>

          <div className={`p-4 rounded-lg border ${getLevelColor('custom')}`}>
            <h4 className="font-bold text-purple-700 text-sm mb-2">Custom (Granular)</h4>
            <p className="text-xs text-purple-600 mb-2">Fine-grained operation-level control</p>
            <p className="text-xs text-purple-600">• Some operations allowed, others denied</p>
            <p className="text-xs text-purple-600">• Configured per entity type</p>
            <p className="text-xs text-purple-600">• Example: Can view but not delete</p>
          </div>

          <div className={`p-4 rounded-lg border ${getLevelColor('no-access')}`}>
            <h4 className="font-bold text-red-700 text-sm mb-2">No Access</h4>
            <p className="text-xs text-red-600 mb-2">Complete access denial</p>
            <p className="text-xs text-red-600">• Module hidden from sidebar</p>
            <p className="text-xs text-red-600">• URL access blocked</p>
            <p className="text-xs text-red-600">• API rejects all requests</p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Select Role to View Access Matrix</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {Object.entries(roleMatrices).map(([key, matrix]) => (
            <button
              key={key}
              onClick={() => setSelectedRole(key)}
              className={`p-4 rounded-lg border transition-colors text-left ${
                selectedRole === key
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 hover:border-border bg-card/50'
              }`}
            >
              <h4 className={`font-bold text-sm ${selectedRole === key ? 'text-primary' : 'text-foreground'}`}>
                {matrix.role}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.values(matrix.modules).filter(m => m.level !== 'no-access').length} modules accessible
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Module Access Matrix for Selected Role */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">{currentMatrix.role} - Module Access Matrix</h3>

        <div className="space-y-2">
          {modules.map(module => {
            const access = currentMatrix.modules[module];
            const isExpanded = expandedModule === module;

            return (
              <div key={module} className={`rounded-lg border p-4 transition-colors ${getLevelColor(access.level)}`}>
                <div
                  onClick={() => setExpandedModule(isExpanded ? '' : module)}
                  className="cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{module}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{getLevelDescription(access.level)}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded font-bold ${getLevelBadge(access.level)}`}>
                    {access.level.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Expanded Operation Details */}
                {isExpanded && access.level === 'custom' && operationExamples[module] && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">Operation Permissions:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {operations.map(op => {
                        const allowed = operationExamples[module]?.[op] ?? false;
                        return (
                          <div key={op} className="flex items-center gap-2">
                            {allowed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-xs ${allowed ? 'text-green-600' : 'text-red-600'} font-medium`}>
                              {op}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission Hierarchy */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Permission Evaluation Hierarchy</h3>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h4 className="font-bold text-foreground">Module-Level Access</h4>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              Can user access this entire module? If NO → module hidden from sidebar, URL blocked, API rejects.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h4 className="font-bold text-foreground">Page-Level Access</h4>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              Can user access this specific page/tab? Example: Can see "Map View" but not "Rack View"
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h4 className="font-bold text-foreground">Operation-Level Access</h4>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              Can user perform this operation (Create/Read/Edit/Delete/Execute/Approve)? Buttons are disabled if not allowed.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                4
              </span>
              <h4 className="font-bold text-foreground">Field-Level Access</h4>
            </div>
            <p className="text-xs text-muted-foreground ml-8">
              Can user access/modify individual fields? Example: Can view "Name" but "Password" is hidden/read-only.
            </p>
          </div>
        </div>
      </div>

      {/* UI Enforcement Examples */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">UI Enforcement Examples</h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="font-bold text-red-700 text-sm mb-2">No Module Access</p>
            <p className="text-xs text-red-600">
              Module hidden from sidebar • URL access blocked: /command-center returns 403 Forbidden
            </p>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="font-bold text-blue-700 text-sm mb-2">Read-Only Module Access</p>
            <p className="text-xs text-blue-600">
              Module visible in sidebar • All buttons grayed out: "Create", "Edit", "Delete" buttons disabled • Content shown but modification prevented
            </p>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="font-bold text-purple-700 text-sm mb-2">Custom Operation Access</p>
            <p className="text-xs text-purple-600">
              Module visible • Some buttons enabled (View, Export) • Some buttons disabled (Delete, Execute)
            </p>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-2">Field-Level Access</p>
            <p className="text-xs text-green-600">
              Some input fields are read-only • Sensitive fields hidden (Password, API Keys) • Calculated fields shown but not editable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
