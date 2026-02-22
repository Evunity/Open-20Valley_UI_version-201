import { useState, useMemo } from "react";
import {
  Lock, Users, Shield, Building2, Settings, GitBranch, AlertCircle, Key,
  Download, Plus, CheckCircle, Clock, AlertTriangle, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import TenantGovernance from "@/components/access-control/TenantGovernance";
import TenantManagement from "@/components/access-control/TenantManagement";
import UserManagement from "@/components/access-control/UserManagement";
import RoleManagement from "@/components/access-control/RoleManagement";
import PermissionManagement from "@/components/access-control/PermissionManagement";
import CrossTenantAccess from "@/components/access-control/CrossTenantAccess";
import TenantPoliciesControl from "@/components/access-control/TenantPoliciesControl";
import TenantSwitcher from "@/components/access-control/TenantSwitcher";
import PermissionEvaluationFlow from "@/components/access-control/PermissionEvaluationFlow";
import ModuleAccessMatrix from "@/components/access-control/ModuleAccessMatrix";
import TemporaryElevation from "@/components/access-control/TemporaryElevation";
import SeparationOfDuties from "@/components/access-control/SeparationOfDuties";
import GlobalSecurityControls from "@/components/access-control/GlobalSecurityControls";
import ComingSoon from "@/pages/ComingSoon";

type AccessControlWorkspace =
  | 'tenant-governance'
  | 'tenant-management'
  | 'user-management'
  | 'role-management'
  | 'permission-management'
  | 'cross-tenant-access'
  | 'tenant-policies'
  | 'permission-flow'
  | 'module-access'
  | 'temporary-elevation'
  | 'separation-duties'
  | 'global-controls';

interface WorkspaceConfig {
  id: AccessControlWorkspace;
  label: string;
  icon: React.FC<any>;
  description: string;
  category: 'governance' | 'administration' | 'security' | 'compliance';
  color: string;
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'tenant-governance',
    label: 'Tenant Governance',
    icon: Building2,
    description: 'Multi-tenant hierarchy, isolation rules, and organizational structure',
    category: 'governance',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'tenant-management',
    label: 'Tenant Management',
    icon: Settings,
    description: 'Provision tenants, manage lifecycle, and configure settings',
    category: 'administration',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: Users,
    description: 'Manage users, assign tenants, and track user access',
    category: 'administration',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'role-management',
    label: 'Role Management',
    icon: Shield,
    description: 'Define roles, inheritance hierarchies, and role-based policies',
    category: 'security',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'permission-management',
    label: 'Permission Management',
    icon: Key,
    description: 'Fine-grained permission control and capability matrix',
    category: 'security',
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'cross-tenant-access',
    label: 'Cross-Tenant Access',
    icon: GitBranch,
    description: 'Multi-tenant access modes, read-only views, and operational access',
    category: 'security',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'tenant-policies',
    label: 'Tenant Policies',
    icon: AlertCircle,
    description: 'Policy inheritance, compliance rules, and data residency',
    category: 'governance',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'permission-flow',
    label: 'Permission Evaluation Flow',
    icon: CheckCircle,
    description: '3-step permission check: Tenant → Role → Policy',
    category: 'security',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'module-access',
    label: 'Module Access Matrix',
    icon: Zap,
    description: 'Module, page, operation-level access control',
    category: 'security',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'temporary-elevation',
    label: 'Temporary Elevation',
    icon: Clock,
    description: 'Just-in-Time privilege elevation with auto-expiry',
    category: 'compliance',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'separation-duties',
    label: 'Separation of Duties',
    icon: AlertTriangle,
    description: 'Prevent dangerous permission combinations',
    category: 'compliance',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'global-controls',
    label: 'Global Security Controls',
    icon: Lock,
    description: 'Emergency guardrails for critical incidents',
    category: 'security',
    color: 'from-red-600 to-red-500'
  }
];

export default function AccessControl() {
  const [activeWorkspace, setActiveWorkspace] = useState<AccessControlWorkspace>('tenant-governance');
  const [showTenantSwitcher, setShowTenantSwitcher] = useState(false);

  const activeConfig = useMemo(
    () => WORKSPACES.find(w => w.id === activeWorkspace),
    [activeWorkspace]
  );

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'tenant-governance':
        return <TenantGovernance />;
      case 'tenant-management':
        return <TenantManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'role-management':
        return <RoleManagement />;
      case 'permission-management':
        return <PermissionManagement />;
      case 'cross-tenant-access':
        return <CrossTenantAccess />;
      case 'tenant-policies':
        return <TenantPoliciesControl />;
      case 'permission-flow':
        return <PermissionEvaluationFlow />;
      case 'module-access':
        return <ModuleAccessMatrix />;
      case 'temporary-elevation':
        return <TemporaryElevation />;
      case 'separation-duties':
        return <SeparationOfDuties />;
      case 'global-controls':
        return <GlobalSecurityControls />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Lock className="w-8 h-8 text-primary" />
                Access Control
              </h1>
              <p className="text-muted-foreground">
                Multi-Tenant Governance | Identity Control | Zero-Trust Security
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTenantSwitcher(!showTenantSwitcher)}
                className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Switch Tenant
              </button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
        {/* Workspace Navigator Sidebar */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card/50">
          <div className="p-4 space-y-2 h-full overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Control Workspaces
              </h3>
            </div>

            {/* Governance Workspaces */}
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-blue-600/70 px-3 py-2">Governance</div>
              {WORKSPACES.filter(w => w.category === 'governance').map(workspace => {
                const Icon = workspace.icon;
                const isActive = activeWorkspace === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{workspace.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Administration Workspaces */}
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-purple-600/70 px-3 py-2">Administration</div>
              {WORKSPACES.filter(w => w.category === 'administration').map(workspace => {
                const Icon = workspace.icon;
                const isActive = activeWorkspace === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{workspace.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Security Workspaces */}
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-red-600/70 px-3 py-2">Security</div>
              {WORKSPACES.filter(w => w.category === 'security').map(workspace => {
                const Icon = workspace.icon;
                const isActive = activeWorkspace === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{workspace.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Compliance Workspaces */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-orange-600/70 px-3 py-2">Compliance</div>
              {WORKSPACES.filter(w => w.category === 'compliance').map(workspace => {
                const Icon = workspace.icon;
                const isActive = activeWorkspace === workspace.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{workspace.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Workspace Header */}
          <div className="border-b border-border bg-card/30 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeConfig && (
                  <>
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      activeConfig.color
                    )}>
                      <activeConfig.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{activeConfig.label}</h2>
                      <p className="text-sm text-muted-foreground">{activeConfig.description}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-semibold capitalize">
                {activeConfig?.category}
              </div>
            </div>
          </div>

          {/* Workspace Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {renderWorkspace()}
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Switcher Modal */}
      {showTenantSwitcher && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card rounded-xl border border-border max-w-2xl w-full mx-4">
            <div className="p-6">
              <TenantSwitcher onClose={() => setShowTenantSwitcher(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
