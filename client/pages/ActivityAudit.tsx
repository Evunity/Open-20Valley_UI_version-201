import { useState, useMemo, useEffect } from "react";
import {
  Shield, Activity, Users, Lock, TrendingUp, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";
import ExecutiveRiskOverview from "@/components/audit/ExecutiveRiskOverview";
import UnifiedActivityStream from "@/components/audit/UnifiedActivityStream";
import SessionIntelligenceCenter from "@/components/audit/SessionIntelligenceCenter";
import PrivilegedAccessRadar from "@/components/audit/PrivilegedAccessRadar";
import BehavioralAnalyticsLayer from "@/components/audit/BehavioralAnalyticsLayer";

type AuditWorkspace =
  | 'executive-risk'
  | 'activity-stream'
  | 'sessions'
  | 'behavioral'
  | 'privileged-access';

interface WorkspaceConfig {
  id: AuditWorkspace;
  label: string;
  icon: LucideIcon;
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'executive-risk',
    label: 'Executive Risk Overview',
    icon: Shield,
  },
  {
    id: 'sessions',
    label: 'Session Intelligence Center',
    icon: Users,
  },
  {
    id: 'behavioral',
    label: 'Behavioral Analytics Layer',
    icon: TrendingUp,
  },
  {
    id: 'activity-stream',
    label: 'Unified Activity Stream',
    icon: Activity,
  },
  {
    id: 'privileged-access',
    label: 'Privileged Access Radar',
    icon: Lock,
  },
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

  const handleDeleteView = (viewName: string) => {
    const updatedViews = { ...savedViews };
    delete updatedViews[viewName];
    localStorage.setItem('auditViews', JSON.stringify(updatedViews));
    setSavedViews(updatedViews);
    if (selectedSavedView === viewName) {
      setSelectedSavedView(null);
    }
  };

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
      case 'privileged-access':
        return <PrivilegedAccessRadar />;
      case 'behavioral':
        return <BehavioralAnalyticsLayer />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full min-h-0 w-full min-w-0 bg-background flex flex-col overflow-hidden">
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

      <div className="bg-card border-b border-border rounded-lg p-4 mx-2 mt-2">
        <div className="grid grid-cols-1 gap-2 auto-rows-max md:grid-cols-2 xl:grid-cols-5">
          {WORKSPACES.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <button
                key={workspace.id}
                onClick={() => setActiveWorkspace(workspace.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition min-h-[180px]",
                  activeWorkspace === workspace.id
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-border hover:border-primary/40 bg-card",
                )}
                title={workspace.label}
              >
                <Icon className={cn("w-6 h-6 flex-shrink-0", activeWorkspace === workspace.id ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")} />
                <span className="text-xs font-semibold text-center text-foreground line-clamp-2 leading-tight">{workspace.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto bg-background">
        <div className="p-2 w-full min-w-0 max-w-none">
          {renderWorkspace()}
        </div>
      </div>
    </div>
  );
}
