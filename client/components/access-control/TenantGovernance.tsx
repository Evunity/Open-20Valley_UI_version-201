import { Building2, Shield, Eye, Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Tenant {
  id: string;
  name: string;
  type: 'parent' | 'child';
  status: 'active' | 'suspended' | 'archived';
  users: number;
  environments: string[];
  isolation: {
    topology: boolean;
    alarms: boolean;
    kpis: boolean;
    automation: boolean;
    reports: boolean;
    databases: boolean;
  };
  parent?: string;
  children?: string[];
}

export default function TenantGovernance() {
  const [expandedTenant, setExpandedTenant] = useState<string>('parent-1');
  const [selectedIsolationView, setSelectedIsolationView] = useState<'matrix' | 'rules'>('matrix');

  const tenants: Tenant[] = [
    {
      id: 'parent-1',
      name: 'Telecom Group',
      type: 'parent',
      status: 'active',
      users: 847,
      environments: ['Production', 'Staging'],
      isolation: {
        topology: true,
        alarms: true,
        kpis: true,
        automation: true,
        reports: true,
        databases: true
      },
      children: ['child-1', 'child-2', 'child-3']
    },
    {
      id: 'child-1',
      name: 'Egypt Operator',
      type: 'child',
      status: 'active',
      users: 342,
      environments: ['Production'],
      isolation: {
        topology: true,
        alarms: true,
        kpis: true,
        automation: true,
        reports: true,
        databases: true
      },
      parent: 'parent-1'
    },
    {
      id: 'child-2',
      name: 'Saudi Operator',
      type: 'child',
      status: 'active',
      users: 298,
      environments: ['Production'],
      isolation: {
        topology: true,
        alarms: true,
        kpis: true,
        automation: true,
        reports: true,
        databases: true
      },
      parent: 'parent-1'
    },
    {
      id: 'child-3',
      name: 'Managed Services Division',
      type: 'child',
      status: 'active',
      users: 156,
      environments: ['Production', 'Staging', 'Lab'],
      isolation: {
        topology: true,
        alarms: true,
        kpis: true,
        automation: true,
        reports: true,
        databases: true
      },
      parent: 'parent-1'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'suspended':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'archived':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Tenant Governance Framework
        </h3>
        <p className="text-sm text-muted-foreground">
          Complete multi-tenant hierarchy with strict data isolation. Each tenant is a completely separate organization with its own users, roles, topology, and operational data.
        </p>
      </div>

      {/* Core Principle */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Two-Layer Security Model
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="font-bold text-blue-700 mb-2">Layer 1: Tenant</p>
            <p className="text-sm text-blue-600">
              Decides which organizational world you belong to. Determines what data you can see across the entire platform.
            </p>
          </div>
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="font-bold text-purple-700 mb-2">Layer 2: Role & Permissions</p>
            <p className="text-sm text-purple-600">
              Defines what actions you can perform within your tenant. Controls automation, configuration changes, and exports.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-sm font-semibold text-red-700">
            ⚠️ Both layers must approve access. If either says NO → access is denied.
          </p>
        </div>
      </div>

      {/* Tenant Hierarchy */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Multi-Organization Hierarchy</h3>

        <div className="space-y-3">
          {tenants.filter(t => t.type === 'parent').map(parentTenant => {
            const childTenants = tenants.filter(t => t.parent === parentTenant.id);
            const isExpanded = expandedTenant === parentTenant.id;

            return (
              <div key={parentTenant.id} className="space-y-2">
                {/* Parent Tenant */}
                <div
                  onClick={() => setExpandedTenant(isExpanded ? '' : parentTenant.id)}
                  className="cursor-pointer rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 hover:bg-blue-500/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-foreground">{parentTenant.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                          PARENT
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold border ${getStatusColor(parentTenant.status)}`}>
                          {parentTenant.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {parentTenant.users} users • {childTenants.length} child tenants
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {parentTenant.environments.map(env => (
                          <span key={env} className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                            {env}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Child Tenants */}
                {isExpanded && childTenants.length > 0 && (
                  <div className="ml-6 space-y-2 border-l-2 border-blue-500/30 pl-4">
                    {childTenants.map(childTenant => (
                      <div
                        key={childTenant.id}
                        className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 hover:bg-purple-500/10 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-4 h-4 text-purple-600" />
                              <h5 className="font-semibold text-foreground">{childTenant.name}</h5>
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-600 text-white font-bold">
                                CHILD
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded font-bold border ${getStatusColor(childTenant.status)}`}>
                                {childTenant.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {childTenant.users} users • Autonomous operations
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {childTenant.environments.map(env => (
                                <span key={env} className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                                  {env}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Parent vs Child Capabilities */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Tenant Capabilities Matrix</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <h4 className="font-bold text-blue-700 mb-3">Parent Tenant Capabilities</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <p className="text-sm text-muted-foreground">View aggregated reports across all children</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <p className="text-sm text-muted-foreground">Monitor global KPIs and compliance</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <p className="text-sm text-muted-foreground">Define global security policies</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <p className="text-sm text-muted-foreground">Execute automation in child tenants (unless approved)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <p className="text-sm text-muted-foreground">Modify child configurations directly</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <h4 className="font-bold text-purple-700 mb-3">Child Tenant Capabilities</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <p className="text-sm text-muted-foreground">Run independent operations</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <p className="text-sm text-muted-foreground">Execute automation within tenant</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <p className="text-sm text-muted-foreground">Modify own parameters and configurations</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <p className="text-sm text-muted-foreground">Manage own users and roles</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <p className="text-sm text-muted-foreground">Override parent policies (unless allowed)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Isolation Matrix */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Data Isolation Rules (Strict)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {['Topology', 'Alarms', 'KPIs', 'Automation', 'Scripts', 'Reports', 'AI Models', 'Databases', 'Audit Logs'].map(item => (
            <div key={item} className="p-4 bg-green-500/5 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-green-600" />
                <p className="font-semibold text-foreground text-sm">{item}</p>
              </div>
              <p className="text-xs text-green-600">
                ✓ Fully isolated per tenant
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ No cross-tenant visibility by default
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Critical Rule: There is NO default cross-tenant visibility. Users in Tenant A behave as if Tenant B does not exist.
          </p>
        </div>
      </div>

      {/* Object Ownership */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Object Ownership Rule</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Every object in the system must belong to exactly ONE tenant. Ownership is immutable and always visible in metadata and audit logs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'Sites', icon: '🗺️' },
            { name: 'Nodes', icon: '🔗' },
            { name: 'Cells', icon: '📡' },
            { name: 'Reports', icon: '📊' },
            { name: 'Scripts', icon: '📝' },
            { name: 'Automations', icon: '⚙️' },
            { name: 'AI Models', icon: '🧠' },
            { name: 'Dashboards', icon: '📈' }
          ].map(obj => (
            <div key={obj.name} className="p-3 bg-muted/30 border border-border/30 rounded-lg flex items-center gap-2">
              <span className="text-xl">{obj.icon}</span>
              <p className="text-sm font-semibold text-foreground">{obj.name}</p>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary ml-auto">1 Tenant</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Rules Summary */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Governance Rules Summary</h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">Rule 1: Tenant Isolation</p>
            <p className="text-xs text-muted-foreground">
              No shared dropdowns, no shared data, no shared dashboards. Full isolation between tenants is mandatory.
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">Rule 2: Cross-Tenant Access</p>
            <p className="text-xs text-muted-foreground">
              Cross-tenant access is NEVER automatic. It must be explicitly enabled with proper audit trails.
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">Rule 3: Policy Inheritance</p>
            <p className="text-xs text-muted-foreground">
              Parent tenants enforce policies on children. Child tenants can override only if parent allows it.
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="font-semibold text-foreground text-sm mb-2">Rule 4: Data Residency</p>
            <p className="text-xs text-muted-foreground">
              Data residency and compliance settings must be visible, auditable, and change-controlled per tenant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
