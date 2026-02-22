import React, { useState } from 'react';
import { Lock, CheckCircle, XCircle, Eye, Pencil } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface PermissionMatrix {
  section: string;
  roles: {
    [roleId: string]: {
      view: boolean;
      edit: boolean;
      approve: boolean;
    };
  };
}

export default function SettingsPermissions() {
  const roles: Role[] = [
    {
      id: 'platform-admin',
      name: 'Platform Admin',
      description: 'Full access to all settings',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'security-admin',
      name: 'Security Admin',
      description: 'Access to security-related settings and approvals',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'integration-admin',
      name: 'Integration Admin',
      description: 'Manage external integrations only',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'performance-admin',
      name: 'Performance Admin',
      description: 'Manage performance and resource limits',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'settings-viewer',
      name: 'Settings Viewer (Read-Only)',
      description: 'View all settings, no modifications',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  const [permissions, setPermissions] = useState<PermissionMatrix[]>([
    {
      section: 'System Configuration',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: false, approve: true },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: true, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Module Configuration',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: false, approve: false },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: true, edit: true, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Integration Settings',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: false, approve: true },
        'integration-admin': { view: true, edit: true, approve: false },
        'performance-admin': { view: false, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Data & Retention Policies',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: false, approve: true },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: true, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Performance & Limits',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: false, edit: false, approve: false },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: true, edit: true, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Notification Settings',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: true, approve: false },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: false, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Automation Guardrails',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: true, approve: true },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: true, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Environment & Deployment',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: false, approve: true },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: true, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Backup & Recovery',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: true, edit: false, approve: true },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: false, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    },
    {
      section: 'Branding & UI',
      roles: {
        'platform-admin': { view: true, edit: true, approve: true },
        'security-admin': { view: false, edit: false, approve: false },
        'integration-admin': { view: false, edit: false, approve: false },
        'performance-admin': { view: false, edit: false, approve: false },
        'settings-viewer': { view: true, edit: false, approve: false }
      }
    }
  ]);

  const togglePermission = (sectionIdx: number, roleId: string, permission: 'view' | 'edit' | 'approve') => {
    setPermissions(prev => {
      const newPerms = [...prev];
      newPerms[sectionIdx].roles[roleId][permission] = !newPerms[sectionIdx].roles[roleId][permission];
      return newPerms;
    });
  };

  const getPermissionBadge = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-gray-400" />
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-6 h-6 text-blue-600" />
          Settings Permissions Model
        </h2>
        <p className="text-gray-500 text-sm mt-1">Define granular access control for different admin roles</p>
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-2 gap-4">
        {roles.map(role => (
          <div key={role.id} className={`p-4 rounded-lg border border-gray-200 ${role.color}`}>
            <h3 className="font-semibold mb-1">{role.name}</h3>
            <p className="text-sm">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-900 w-40">Settings Section</th>
                {roles.map(role => (
                  <th key={role.id} className="px-4 py-3 text-center font-semibold text-gray-900 text-sm">
                    <div className={`py-1 px-2 rounded text-xs font-semibold ${role.color}`}>
                      {role.name.split(' ')[0]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-200">{perm.section}</td>
                  {roles.map(role => (
                    <td key={role.id} className="px-4 py-3 text-center border-r border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2" title="View permission">
                          {getPermissionBadge(perm.roles[role.id].view)}
                          <span className="text-xs text-gray-600">View</span>
                        </div>
                        <div className="flex items-center justify-center gap-2" title="Edit permission">
                          {getPermissionBadge(perm.roles[role.id].edit)}
                          <span className="text-xs text-gray-600">Edit</span>
                        </div>
                        <div className="flex items-center justify-center gap-2" title="Approve permission">
                          {getPermissionBadge(perm.roles[role.id].approve)}
                          <span className="text-xs text-gray-600">Approve</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Explanation */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">View</h4>
          </div>
          <p className="text-sm text-gray-700">Can view settings but cannot make changes. Read-only access for review and compliance purposes.</p>
        </div>

        <div className="p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <Pencil className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Edit</h4>
          </div>
          <p className="text-sm text-gray-700">Can modify settings. Changes may be logged and may require approval if high-risk.</p>
        </div>

        <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-orange-600" />
            <h4 className="font-semibold text-gray-900">Approve</h4>
          </div>
          <p className="text-sm text-gray-700">Can review and approve high-risk settings changes made by others.</p>
        </div>
      </div>

      {/* Role Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Role Access Examples</h3>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2 text-red-800">Platform Admin</h4>
          <p className="text-sm text-gray-700 mb-2">Full access to all settings with approval authority</p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Can view, edit, and approve changes in all settings sections</li>
            <li>Can approve high-risk changes from other admins</li>
            <li>Can manage other admin roles and permissions</li>
            <li>All actions are audited</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2 text-orange-800">Security Admin</h4>
          <p className="text-sm text-gray-700 mb-2">Security-focused settings with approval authority</p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Can view most settings and edit security-related configurations</li>
            <li>Can approve high-risk changes (guardrails, retention, integrations)</li>
            <li>Cannot modify performance or integration details</li>
            <li>Focused on compliance and security controls</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2 text-blue-800">Integration Admin</h4>
          <p className="text-sm text-gray-700 mb-2">External integrations management</p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Can view and edit integration settings only</li>
            <li>Cannot approve changes (requires Platform or Security Admin)</li>
            <li>Can add, modify, and test external system connections</li>
            <li>No access to core system or security settings</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2 text-green-800">Performance Admin</h4>
          <p className="text-sm text-gray-700 mb-2">System performance and resource optimization</p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Can view and edit performance limits and resource allocation</li>
            <li>Can view module behavior settings but cannot edit</li>
            <li>Cannot approve changes (requires Platform Admin)</li>
            <li>Responsible for system capacity and response times</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2 text-gray-800">Settings Viewer (Read-Only)</h4>
          <p className="text-sm text-gray-700 mb-2">Audit and compliance review</p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Can view all settings sections for audit purposes</li>
            <li>Cannot make any modifications</li>
            <li>Can access audit trail and change history</li>
            <li>Ideal for compliance officers and auditors</li>
          </ul>
        </div>
      </div>

      {/* Best Practices */}
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Least Privilege Principle</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex gap-2">
            <span className="font-semibold">✓ Assign minimum permissions:</span>
            <span>Each role should have only the permissions necessary for their job</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Separate duties:</span>
            <span>Those who edit high-risk settings should not approve their own changes</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Regular review:</span>
            <span>Audit admin roles quarterly and revoke unnecessary access</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Approval requirements:</span>
            <span>Always require approval for critical settings in production</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold">✓ Multi-approval for critical:</span>
            <span>Consider requiring 2+ approvals for high-risk changes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
