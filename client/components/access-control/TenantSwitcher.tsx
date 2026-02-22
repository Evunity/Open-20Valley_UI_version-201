import { Building2, Check, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface TenantOption {
  id: string;
  name: string;
  role: string;
  environment: string;
  status: 'active' | 'suspended';
  isCurrent: boolean;
}

interface Props {
  onClose?: () => void;
}

export default function TenantSwitcher({ onClose }: Props) {
  const [selectedTenant, setSelectedTenant] = useState<string>('tenant-1');

  const tenants: TenantOption[] = [
    {
      id: 'tenant-1',
      name: 'Egypt Operator',
      role: 'System Admin',
      environment: 'Production',
      status: 'active',
      isCurrent: true
    },
    {
      id: 'tenant-2',
      name: 'Saudi Operator',
      role: 'Operations Manager',
      environment: 'Production',
      status: 'active',
      isCurrent: false
    },
    {
      id: 'tenant-3',
      name: 'Telecom Group (Parent)',
      role: 'Executive Viewer',
      environment: 'Production',
      status: 'active',
      isCurrent: false
    },
    {
      id: 'tenant-4',
      name: 'Enterprise Network',
      role: 'Operator',
      environment: 'Staging',
      status: 'active',
      isCurrent: false
    }
  ];

  const currentTenant = tenants.find(t => t.isCurrent)!;
  const otherTenants = tenants.filter(t => !t.isCurrent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-foreground">Tenant Switcher</h3>
          <p className="text-sm text-muted-foreground">
            Switch between your assigned tenants. Switching is intentional to prevent mistakes.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Current Tenant */}
      <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Currently In</p>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-foreground text-lg">{currentTenant.name}</h4>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary text-primary-foreground">
                CURRENT
              </span>
            </div>
          </div>
          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Your Role</p>
            <p className="font-semibold text-foreground">{currentTenant.role}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Environment</p>
            <p className="font-semibold text-foreground">{currentTenant.environment}</p>
          </div>
        </div>
      </div>

      {/* Available Tenants */}
      {otherTenants.length > 0 && (
        <>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Available Tenants ({otherTenants.length})
            </p>

            <div className="space-y-2">
              {otherTenants.map(tenant => (
                <div
                  key={tenant.id}
                  onClick={() => setSelectedTenant(tenant.id)}
                  className={`cursor-pointer p-4 rounded-lg border transition-colors ${
                    selectedTenant === tenant.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-border bg-card/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${selectedTenant === tenant.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h5 className={`font-semibold ${selectedTenant === tenant.id ? 'text-primary' : 'text-foreground'}`}>
                        {tenant.name}
                      </h5>
                    </div>
                    {tenant.status === 'suspended' && (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs ml-6">
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="text-foreground font-semibold">{tenant.role}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Environment</p>
                      <p className="text-foreground font-semibold">{tenant.environment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Switch Button */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Switch to {tenants.find(t => t.id === selectedTenant)?.name}
            </button>
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-700">
          <span className="font-bold">Why Intentional Switching?</span> Prevents catastrophic mistakes. Each tenant has isolated data. Switching context clearly signals environment change.
        </p>
      </div>

      {/* Key Information */}
      <div className="space-y-2 text-xs">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <p className="font-semibold text-foreground mb-1">What gets isolated:</p>
          <p className="text-muted-foreground">
            All topology, alarms, KPIs, automation, reports, and data are completely separate per tenant.
          </p>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <p className="font-semibold text-foreground mb-1">Your permissions:</p>
          <p className="text-muted-foreground">
            Different roles in different tenants. Always check your role when switching.
          </p>
        </div>
      </div>
    </div>
  );
}
