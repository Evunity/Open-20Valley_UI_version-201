import { Settings, Plus, Edit, Archive, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface TenantConfig {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'archived';
  country: string;
  timezone: string;
  type: string;
  dataRetention: string;
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  createdAt: string;
  branding?: string;
  ipAllowlist?: string[];
}

export default function TenantManagement() {
  const [expandedTenant, setExpandedTenant] = useState<string>('tenant-1');
  const [showNewTenant, setShowNewTenant] = useState(false);

  const tenants: TenantConfig[] = [
    {
      id: 'tenant-1',
      name: 'Egypt Operator',
      status: 'active',
      country: 'Egypt',
      timezone: 'Africa/Cairo',
      type: 'Telecom Operator',
      dataRetention: '7 years',
      securityLevel: 'enhanced',
      createdAt: '2023-06-15',
      branding: 'Egyptian Telecom Theme',
      ipAllowlist: ['192.168.1.0/24', '10.20.30.0/24']
    },
    {
      id: 'tenant-2',
      name: 'Saudi Operator',
      status: 'active',
      country: 'Saudi Arabia',
      timezone: 'Asia/Riyadh',
      type: 'Telecom Operator',
      dataRetention: '10 years',
      securityLevel: 'maximum',
      createdAt: '2023-08-20',
      branding: 'Saudi Telecom Theme',
      ipAllowlist: ['172.16.0.0/16']
    },
    {
      id: 'tenant-3',
      name: 'Enterprise Network',
      status: 'active',
      country: 'United States',
      timezone: 'America/New_York',
      type: 'Enterprise',
      dataRetention: '3 years',
      securityLevel: 'standard',
      createdAt: '2024-01-10',
      branding: 'Enterprise Theme'
    }
  ];

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'maximum':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      case 'enhanced':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-700';
      case 'standard':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white';
      case 'suspended':
        return 'bg-yellow-600 text-white';
      case 'archived':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Tenant Provisioning & Lifecycle Management
        </h3>
        <p className="text-sm text-muted-foreground">
          Create new tenants, configure settings, manage organizational structure, and handle tenant lifecycle (Active, Suspended, Archived).
        </p>
      </div>

      {/* Tenant Creation Info */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tenant Creation Requirements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Required Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Tenant name</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Country</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Timezone</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Organization type</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Data retention policy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Security level</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Optional Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Branding</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Allowed email domains</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">IP allowlist</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Regulatory profile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-700">
            <span className="font-semibold">Automatic Provisioning:</span> Default roles, permissions, audit policies, and security settings are auto-generated.
          </p>
        </div>
      </div>

      {/* Auto-Generated Resources */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Auto-Generated on Creation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <h4 className="font-semibold text-blue-700 text-sm mb-2">✓ Default Roles</h4>
            <p className="text-xs text-blue-600">
              Admin, Manager, Operator, Viewer, Auditor roles automatically created with appropriate permissions.
            </p>
          </div>
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <h4 className="font-semibold text-purple-700 text-sm mb-2">✓ Default Permissions</h4>
            <p className="text-xs text-purple-600">
              Complete permission matrix configured based on security level and organization type.
            </p>
          </div>
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <h4 className="font-semibold text-green-700 text-sm mb-2">✓ Audit Policies</h4>
            <p className="text-xs text-green-600">
              Immutable audit logging, retention policies, and compliance tracking automatically enabled.
            </p>
          </div>
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <h4 className="font-semibold text-orange-700 text-sm mb-2">✓ Security Settings</h4>
            <p className="text-xs text-orange-600">
              MFA, password policies, session management, and encryption settings pre-configured.
            </p>
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Current Tenants
          </h3>
          <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" />
            New Tenant
          </button>
        </div>

        <div className="space-y-3">
          {tenants.map(tenant => {
            const isExpanded = expandedTenant === tenant.id;
            return (
              <div key={tenant.id} className="rounded-lg border border-border/50 p-4 hover:border-border transition-colors">
                <div
                  onClick={() => setExpandedTenant(isExpanded ? '' : tenant.id)}
                  className="cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{tenant.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getStatusColor(tenant.status)}`}>
                        {tenant.status.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-bold ${getSecurityColor(tenant.securityLevel)}`}>
                        {tenant.securityLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {tenant.country} • {tenant.timezone} • {tenant.type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                        Retention: {tenant.dataRetention}
                      </span>
                      <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                        Created: {tenant.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Configuration</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-mono text-foreground">{tenant.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Country:</span>
                            <span className="font-mono text-foreground">{tenant.country}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timezone:</span>
                            <span className="font-mono text-foreground">{tenant.timezone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Retention:</span>
                            <span className="font-mono text-foreground">{tenant.dataRetention}</span>
                          </div>
                        </div>
                      </div>

                      {tenant.branding && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Branding</p>
                          <p className="text-sm text-foreground">{tenant.branding}</p>
                        </div>
                      )}

                      {tenant.ipAllowlist && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">IP Allowlist</p>
                          <div className="space-y-1">
                            {tenant.ipAllowlist.map((ip, idx) => (
                              <p key={idx} className="text-sm font-mono text-foreground bg-muted/30 px-2 py-1 rounded">
                                {ip}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border/30">
                      <button className="flex-1 px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center justify-center gap-1">
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="flex-1 px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center justify-center gap-1">
                        <Archive className="w-3 h-3" />
                        Suspend
                      </button>
                      <button className="flex-1 px-3 py-1.5 rounded border border-red-500/30 text-red-700 hover:bg-red-500/10 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Archive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tenant Lifecycle */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Tenant Lifecycle States</h3>

        <div className="space-y-3">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-1">✓ Active</p>
            <p className="text-xs text-green-600">
              Tenant is operational. Users can access, perform operations, and generate data. Full system access allowed.
            </p>
          </div>
          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="font-bold text-yellow-700 text-sm mb-1">⏸ Suspended</p>
            <p className="text-xs text-yellow-600">
              Tenant is temporarily disabled. Users cannot log in. Operations are halted. Audit logs remain immutable. Can be reactivated.
            </p>
          </div>
          <div className="p-4 bg-gray-500/5 border border-gray-500/20 rounded-lg">
            <p className="font-bold text-gray-700 text-sm mb-1">📦 Archived</p>
            <p className="text-xs text-gray-600">
              Tenant is permanently disabled. No user access. Data retained per compliance policy. Cannot be reactivated directly.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-700">
            <span className="font-bold">Hard Deletion Policy:</span> Tenants are never permanently deleted without compliance approval, full audit records, and data retention validation.
          </p>
        </div>
      </div>
    </div>
  );
}
