import { Users, Plus, Edit, Trash2, Shield, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  tenants: Array<{ name: string; role: string }>;
  mfaEnabled: boolean;
  lastLogin: string;
}

export default function UserManagement() {
  const [expandedUser, setExpandedUser] = useState<string>('user-1');

  const users: User[] = [
    {
      id: 'user-1',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@operator.eg',
      status: 'active',
      tenants: [
        { name: 'Egypt Operator', role: 'System Admin' },
        { name: 'Telecom Group', role: 'Executive Viewer' }
      ],
      mfaEnabled: true,
      lastLogin: '2024-03-11 14:30'
    },
    {
      id: 'user-2',
      name: 'Sarah Williams',
      email: 'sarah.williams@operator.sa',
      status: 'active',
      tenants: [
        { name: 'Saudi Operator', role: 'Operations Manager' }
      ],
      mfaEnabled: true,
      lastLogin: '2024-03-11 10:15'
    },
    {
      id: 'user-3',
      name: 'Mohammed Ali',
      email: 'mohammed.ali@enterprise.com',
      status: 'active',
      tenants: [
        { name: 'Enterprise Network', role: 'Operator' }
      ],
      mfaEnabled: false,
      lastLogin: '2024-03-10 16:45'
    },
    {
      id: 'user-4',
      name: 'Lisa Chen',
      email: 'lisa.chen@newoperator.com',
      status: 'pending',
      tenants: [
        { name: 'Enterprise Network', role: 'Operator' }
      ],
      mfaEnabled: false,
      lastLogin: 'Never'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'inactive':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-700';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white';
      case 'inactive':
        return 'bg-gray-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          User Management & Access Control
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage users, assign to tenants, configure roles, and track access. Each user can access multiple tenants with different roles per tenant.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border/50 p-4 bg-card/50">
          <p className="text-xs text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-xs text-green-700 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-700">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-xs text-yellow-700 mb-1">Pending Activation</p>
          <p className="text-2xl font-bold text-yellow-700">{users.filter(u => u.status === 'pending').length}</p>
        </div>
        <div className="rounded-lg border border-border/50 p-4 bg-card/50">
          <p className="text-xs text-muted-foreground mb-1">MFA Enabled</p>
          <p className="text-2xl font-bold text-foreground">{users.filter(u => u.mfaEnabled).length}</p>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">User Directory</h3>
          <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        <div className="space-y-3">
          {users.map(user => {
            const isExpanded = expandedUser === user.id;
            return (
              <div key={user.id} className={`rounded-lg border p-4 transition-colors ${getStatusColor(user.status)}`}>
                <div
                  onClick={() => setExpandedUser(isExpanded ? '' : user.id)}
                  className="cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{user.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusBadge(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                      {user.mfaEnabled && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          MFA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{user.email}</p>
                    <div className="flex flex-wrap gap-2">
                      {user.tenants.map((t, idx) => (
                        <span key={idx} className="text-xs bg-white/20 text-foreground px-2 py-1 rounded">
                          {t.name}: {t.role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last: {user.lastLogin}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold mb-2">Assigned Tenants</p>
                        <div className="space-y-1">
                          {user.tenants.map((t, idx) => (
                            <div key={idx} className="p-2 bg-white/10 rounded text-xs">
                              <p className="font-semibold text-foreground">{t.name}</p>
                              <p className="text-foreground/70">Role: {t.role}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-2">Security Status</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-foreground/70">MFA:</span>
                            <span className="font-semibold">{user.mfaEnabled ? '✓ Enabled' : '✗ Disabled'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Status:</span>
                            <span className="font-semibold">{user.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Last Login:</span>
                            <span className="font-semibold">{user.lastLogin}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/20">
                      <button className="flex-1 px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="flex-1 px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        Manage Roles
                      </button>
                      <button className="flex-1 px-3 py-1.5 rounded border border-red-500/30 text-red-700 hover:bg-red-500/10 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Deactivate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Provisioning Info */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">User Provisioning Workflow</h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">Create User Account</p>
                <p className="text-xs text-muted-foreground">
                  Invitation email sent to new user with secure setup link.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">Assign to Tenants</p>
                <p className="text-xs text-muted-foreground">
                  User assigned to one or more tenants with appropriate role for each.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">Configure Security</p>
                <p className="text-xs text-muted-foreground">
                  MFA enabled, password policies applied, session limits set.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">Activation</p>
                <p className="text-xs text-muted-foreground">
                  User completes setup and can begin accessing assigned tenants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
