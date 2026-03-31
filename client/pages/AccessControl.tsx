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

  const renderDashboard = () => (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="space-y-8">
        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Tenants</p>
                <p className="text-3xl font-bold text-foreground">12</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Users</p>
                <p className="text-3xl font-bold text-foreground">248</p>
              </div>
              <Users className="w-8 h-8 text-green-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Roles Defined</p>
                <p className="text-3xl font-bold text-foreground">34</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Security Alerts</p>
                <p className="text-3xl font-bold text-red-600">3</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500/50" />
            </div>
          </div>
        </div>

        {/* Quick Access Sections */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Essential Controls</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <button onClick={() => setActiveWorkspace('tenant-governance')} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all text-left group">
              <div className="flex items-start justify-between mb-3">
                <Building2 className="w-6 h-6 text-blue-500 group-hover:text-blue-400" />
                <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">CRITICAL</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Tenant Governance</h3>
              <p className="text-sm text-muted-foreground">Manage tenant hierarchy, isolation, and organization structure</p>
            </button>

            <button onClick={() => setActiveWorkspace('module-access')} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all text-left group">
              <div className="flex items-start justify-between mb-3">
                <Key className="w-6 h-6 text-orange-500 group-hover:text-orange-400" />
                <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded">CORE</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Permission Matrix</h3>
              <p className="text-sm text-muted-foreground">Define module, page, and operation-level access controls</p>
            </button>

            <button onClick={() => setActiveWorkspace('user-management')} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all text-left group">
              <div className="flex items-start justify-between mb-3">
                <Users className="w-6 h-6 text-green-500 group-hover:text-green-400" />
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">IMPORTANT</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">User & Role Management</h3>
              <p className="text-sm text-muted-foreground">Manage users, assign roles, and control access levels</p>
            </button>
          </div>
        </div>

        {/* Security & Compliance */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Security & Compliance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <button onClick={() => setActiveWorkspace('global-controls')} className="bg-card border border-red-500/30 rounded-lg p-6 hover:border-red-500/60 transition-all text-left group">
              <div className="flex items-start justify-between mb-3">
                <Zap className="w-6 h-6 text-red-500 group-hover:text-red-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Global Security Controls</h3>
              <p className="text-sm text-muted-foreground">Emergency kill switches, automation freeze, read-only mode</p>
            </button>

            <button onClick={() => setActiveWorkspace('separation-duties')} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all text-left group">
              <div className="flex items-start justify-between mb-3">
                <Shield className="w-6 h-6 text-purple-500 group-hover:text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Separation of Duties</h3>
              <p className="text-sm text-muted-foreground">Prevent dangerous permission combinations and conflicts</p>
            </button>
          </div>
        </div>
      </div>
    </div>
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
        return renderDashboard();
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
                Access Control & Tenant Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Multi-tenant governance, role-based access control, and security policies</p>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden">
            <div className="p-4 md:p-5 max-h-[85vh] overflow-y-auto">
              <TenantSwitcher onClose={() => setShowTenantSwitcher(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
