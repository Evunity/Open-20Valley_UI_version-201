import { useState, useMemo } from "react";
import { 
  Shield, Activity, SearchCode, Users, GitBranch, Lock, TrendingUp, 
  Download, Settings, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExecutiveRiskOverview from "@/components/audit/ExecutiveRiskOverview";
import UnifiedActivityStream from "@/components/audit/UnifiedActivityStream";
import ForensicInvestigationExplorer from "@/components/audit/ForensicInvestigationExplorer";
import SessionIntelligenceCenter from "@/components/audit/SessionIntelligenceCenter";
import CrossSystemIncidentTimeline from "@/components/audit/CrossSystemIncidentTimeline";
import PrivilegedAccessRadar from "@/components/audit/PrivilegedAccessRadar";
import BehavioralAnalyticsLayer from "@/components/audit/BehavioralAnalyticsLayer";

type AuditWorkspace = 
  | 'executive-risk'
  | 'activity-stream'
  | 'forensic'
  | 'sessions'
  | 'timeline'
  | 'privileged-access'
  | 'behavioral';

interface WorkspaceConfig {
  id: AuditWorkspace;
  label: string;
  icon: React.FC<any>;
  description: string;
  domain: 'security' | 'compliance' | 'forensics' | 'governance';
  color: string;
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'executive-risk',
    label: 'Executive Risk Overview',
    icon: Shield,
    description: 'Is the platform operating safely? Real-time risk scoring',
    domain: 'security',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'activity-stream',
    label: 'Unified Activity Stream',
    icon: Activity,
    description: 'Complete immutable log of all platform events',
    domain: 'compliance',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'forensic',
    label: 'Forensic Investigation Explorer',
    icon: SearchCode,
    description: 'Deep-dive analysis for security incidents and compliance',
    domain: 'forensics',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'sessions',
    label: 'Session Intelligence Center',
    icon: Users,
    description: 'User session analysis and behavioral tracking',
    domain: 'security',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'timeline',
    label: 'Cross-System Incident Timeline',
    icon: GitBranch,
    description: 'Multi-module incident reconstruction and correlation',
    domain: 'forensics',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'privileged-access',
    label: 'Privileged Access Radar',
    icon: Lock,
    description: 'Track admin actions, escalations, and policy violations',
    domain: 'governance',
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'behavioral',
    label: 'Behavioral Analytics Layer',
    icon: TrendingUp,
    description: 'Detect anomalies and insider threat patterns',
    domain: 'security',
    color: 'from-indigo-500 to-blue-500'
  }
];

export default function ActivityAuditModule() {
  const [activeWorkspace, setActiveWorkspace] = useState<AuditWorkspace>('executive-risk');
  const [timeMode, setTimeMode] = useState<'live' | 'investigative' | 'historical'>('live');

  const activeConfig = useMemo(
    () => WORKSPACES.find(w => w.id === activeWorkspace),
    [activeWorkspace]
  );

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'executive-risk':
        return <ExecutiveRiskOverview />;
      case 'activity-stream':
        return <UnifiedActivityStream />;
      case 'forensic':
        return <ForensicInvestigationExplorer />;
      case 'sessions':
        return <SessionIntelligenceCenter />;
      case 'timeline':
        return <CrossSystemIncidentTimeline />;
      case 'privileged-access':
        return <PrivilegedAccessRadar />;
      case 'behavioral':
        return <BehavioralAnalyticsLayer />;
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
              <h1 className="text-3xl font-bold text-foreground">Activity & Audit Module</h1>
              <p className="text-muted-foreground">
                Forensic Traceability | Security Visibility | Compliance Intelligence
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
                <span className="text-xs font-semibold text-muted-foreground">MODE:</span>
                <select 
                  value={timeMode}
                  onChange={(e) => setTimeMode(e.target.value as any)}
                  className="bg-transparent text-sm font-medium text-foreground focus:outline-none"
                >
                  <option value="live">Live</option>
                  <option value="investigative">Investigative</option>
                  <option value="historical">Historical</option>
                </select>
              </div>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
        {/* Workspace Navigator Sidebar */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card/50">
          <div className="p-4 space-y-2 h-full overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Intelligence Workspaces
              </h3>
            </div>

            {/* Security Workspaces */}
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-red-600/70 px-3 py-2">Security</div>
              {WORKSPACES.filter(w => w.domain === 'security').map(workspace => {
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
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-blue-600/70 px-3 py-2">Compliance</div>
              {WORKSPACES.filter(w => w.domain === 'compliance').map(workspace => {
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

            {/* Forensics Workspaces */}
            <div className="space-y-1 mb-6">
              <div className="text-xs font-semibold text-purple-600/70 px-3 py-2">Forensics</div>
              {WORKSPACES.filter(w => w.domain === 'forensics').map(workspace => {
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

            {/* Governance Workspaces */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-orange-600/70 px-3 py-2">Governance</div>
              {WORKSPACES.filter(w => w.domain === 'governance').map(workspace => {
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
                {activeConfig?.domain}
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
    </div>
  );
}
