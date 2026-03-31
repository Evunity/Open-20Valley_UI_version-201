import { useState, useMemo, useEffect } from "react";
import {
  Shield, Activity, Users, GitBranch, Lock, TrendingUp,
  Download, Settings, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExecutiveRiskOverview from "@/components/audit/ExecutiveRiskOverview";
import UnifiedActivityStream from "@/components/audit/UnifiedActivityStream";
import SessionIntelligenceCenter from "@/components/audit/SessionIntelligenceCenter";
import CrossSystemIncidentTimeline from "@/components/audit/CrossSystemIncidentTimeline";
import PrivilegedAccessRadar from "@/components/audit/PrivilegedAccessRadar";
import BehavioralAnalyticsLayer from "@/components/audit/BehavioralAnalyticsLayer";
import UserProfilesAudit from "@/components/audit/UserProfilesAudit";

type AuditWorkspace =
  | 'executive-risk'
  | 'activity-stream'
  | 'sessions'
  | 'timeline'
  | 'privileged-access'
  | 'behavioral'
  | 'user-profiles';

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
  },
  {
    id: 'user-profiles',
    label: 'User Profiles',
    icon: Users,
    description: 'Complete user profiles with all audit insights',
    domain: 'governance',
    color: 'from-cyan-500 to-blue-500'
  }
];

export default function ActivityAudit() {
  const [activeWorkspace, setActiveWorkspace] = useState<AuditWorkspace>('executive-risk');
  const [timeMode, setTimeMode] = useState<'live' | 'investigative' | 'historical'>('live');
  const [savedViews, setSavedViews] = useState<Record<string, any>>({});
  const [selectedSavedView, setSelectedSavedView] = useState<string | null>(null);

  useEffect(() => {
    const views = JSON.parse(localStorage.getItem('auditViews') || '{}');
    setSavedViews(views);
  }, []);

  const activeConfig = useMemo(
    () => WORKSPACES.find(w => w.id === activeWorkspace),
    [activeWorkspace]
  );

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'executive-risk':
        return <ExecutiveRiskOverview />;
      case 'activity-stream':
        return <UnifiedActivityStream onSaveView={() => {
          const views = JSON.parse(localStorage.getItem('auditViews') || '{}');
          setSavedViews(views);
        }} selectedView={selectedSavedView} />;
      case 'sessions':
        return <SessionIntelligenceCenter />;
      case 'timeline':
        return <CrossSystemIncidentTimeline />;
      case 'privileged-access':
        return <PrivilegedAccessRadar />;
      case 'behavioral':
        return <BehavioralAnalyticsLayer />;
      case 'user-profiles':
        return <UserProfilesAudit />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-8 py-3">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 h-10 rounded-lg border border-border bg-background">
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">MODE:</span>
                <Select value={timeMode} onValueChange={(value) => setTimeMode(value as any)}>
                  <SelectTrigger className="h-8 min-w-[150px] border-0 bg-transparent px-1 text-sm font-medium text-foreground focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="investigative">Investigative</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)]">
        {/* Workspace Navigator Sidebar */}
        <div className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-border bg-card/50">
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

            {/* Governance Workspaces */}
            <div className="space-y-1 mb-6">
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

            {/* Saved Views - only show if on activity-stream workspace */}
            {activeWorkspace === 'activity-stream' && Object.keys(savedViews).length > 0 && (
              <div className="space-y-1 pt-4 border-t border-border">
                <div className="text-xs font-semibold text-purple-600/70 px-3 py-2">Saved Views</div>
                {Object.keys(savedViews).map(viewName => (
                  <button
                    key={viewName}
                    onClick={() => setSelectedSavedView(viewName)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left group",
                      selectedSavedView === viewName
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Eye className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{viewName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Workspace Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {renderWorkspace()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
