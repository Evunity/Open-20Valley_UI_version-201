export type AutomationStatus = 'success' | 'pending' | 'rollback' | 'failed';
export type AutomationType = 'cell_outage_recovery' | 'kpi_degradation' | 'transport_failover' | 'parameter_drift' | 'custom';
export type ExecutionStage = 'detected' | 'decision' | 'executed' | 'validated';

export interface AutomationMetrics {
  autonomousResolutionRate: number; // 0-100%
  automationRiskIndex: number; // 0-100
  closedLoopSuccess: number; // 0-100%
  mttar: number; // Mean Time To Auto-Resolution in minutes
}

export interface ExecutionStageInfo {
  stage: ExecutionStage;
  timestamp: string;
  status: AutomationStatus;
  details: string;
}

export interface AutomationActivity {
  id: string;
  name: string;
  type: AutomationType;
  trigger: string;
  affectedObjects: string[];
  stages: ExecutionStageInfo[];
  subscribersSaved: number;
  risk: 'low' | 'medium' | 'high';
  createdAt: string;
  duration: number; // milliseconds
}

export interface LiveAutonomyEvent {
  id: string;
  timestamp: string;
  action: string;
  scope: string;
  status: 'success' | 'pending' | 'rollback';
  impact: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  type: AutomationType;
  category: string;
  thumbnail?: string;
}

export interface RiskPreview {
  estimatedNodesAffected: number;
  maxSubscribersImpacted: number;
  pastFailureRate: number;
  trustScoreProjection: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RunbookNode {
  id: string;
  type: 'trigger' | 'action' | 'decision' | 'wait' | 'validation';
  label: string;
  config: Record<string, any>;
  expectedRuntime?: number;
  rollbackAvailable?: boolean;
}

export interface RunbookEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface Runbook {
  id: string;
  name: string;
  description: string;
  nodes: RunbookNode[];
  edges: RunbookEdge[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationPolicy {
  id: string;
  name: string;
  description: string;
  constraints: string[];
  approvalRequired: boolean;
  maxRiskLevel: 'low' | 'medium' | 'high';
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'template_1',
    name: 'Cell Outage Recovery',
    description: 'Automatic recovery when a cell site detects outage',
    type: 'cell_outage_recovery',
    category: 'Radio Access',
    thumbnail: '📡'
  },
  {
    id: 'template_2',
    name: 'Massive KPI Degradation',
    description: 'Trigger recovery when KPIs degrade beyond threshold',
    type: 'kpi_degradation',
    category: 'Performance',
    thumbnail: '📉'
  },
  {
    id: 'template_3',
    name: 'Transport Link Failover',
    description: 'Automatic failover for transport network links',
    type: 'transport_failover',
    category: 'Transport',
    thumbnail: '🔄'
  },
  {
    id: 'template_4',
    name: 'Parameter Drift Correction',
    description: 'Correct configuration parameters that drift from baseline',
    type: 'parameter_drift',
    category: 'Configuration',
    thumbnail: '⚙️'
  }
];

export function generateMockAutomationMetrics(): AutomationMetrics {
  return {
    autonomousResolutionRate: Math.floor(Math.random() * 30 + 65),
    automationRiskIndex: Math.floor(Math.random() * 30 + 15),
    closedLoopSuccess: Math.floor(Math.random() * 20 + 78),
    mttar: Math.floor(Math.random() * 15 + 8)
  };
}

export function generateMockAutomationActivity(count: number = 15): AutomationActivity[] {
  const activities: AutomationActivity[] = [];
  const types: AutomationType[] = ['cell_outage_recovery', 'kpi_degradation', 'transport_failover', 'parameter_drift'];
  const risks: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 3600000 * i);
    activities.push({
      id: `activity_${i}`,
      name: `Automation Event ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      trigger: `Trigger: ${['CPU threshold exceeded', 'Connection loss detected', 'Config drift detected', 'KPI below baseline'][Math.floor(Math.random() * 4)]}`,
      affectedObjects: [
        `Site_${Math.floor(Math.random() * 50 + 1)}`,
        `Cell_${Math.floor(Math.random() * 200 + 1)}`,
        `Interface_${Math.floor(Math.random() * 100 + 1)}`
      ],
      stages: [
        {
          stage: 'detected',
          timestamp: createdAt.toISOString(),
          status: 'success',
          details: 'Issue detected by monitoring system'
        },
        {
          stage: 'decision',
          timestamp: new Date(createdAt.getTime() + 5000).toISOString(),
          status: 'success',
          details: 'AI model evaluated and approved action'
        },
        {
          stage: 'executed',
          timestamp: new Date(createdAt.getTime() + 10000).toISOString(),
          status: Math.random() > 0.1 ? 'success' : 'rollback',
          details: 'Automation executed successfully'
        },
        {
          stage: 'validated',
          timestamp: new Date(createdAt.getTime() + 15000).toISOString(),
          status: 'success',
          details: 'System validated recovery'
        }
      ],
      subscribersSaved: Math.floor(Math.random() * 50000 + 5000),
      risk: risks[Math.floor(Math.random() * risks.length)],
      createdAt: createdAt.toISOString(),
      duration: Math.floor(Math.random() * 20000 + 5000)
    });
  }

  return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateMockLiveEvents(count: number = 8): LiveAutonomyEvent[] {
  const events: LiveAutonomyEvent[] = [];
  const actions = [
    'AI triggered Cell Outage Recovery',
    'Restarted DU – Cluster East',
    'Failover initiated for transport link',
    'Parameter correction applied to BTS-102',
    'KPI threshold auto-recovery started',
    'Config validation passed',
    'Subscribers restored: 12,440',
    'System in steady state'
  ];

  for (let i = 0; i < count; i++) {
    events.push({
      id: `event_${i}`,
      timestamp: new Date(Date.now() - Math.random() * 600000).toISOString(),
      action: actions[i % actions.length],
      scope: ['Cluster East', 'Region North', 'Site Alexandria', 'Transport Backbone'][Math.floor(Math.random() * 4)],
      status: ['success', 'success', 'success', 'pending', 'rollback'][Math.floor(Math.random() * 5)] as 'success' | 'pending' | 'rollback',
      impact: `Impact: ${Math.floor(Math.random() * 30000 + 1000)} subscribers`
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateMockPolicies(): AutomationPolicy[] {
  return [
    {
      id: 'policy_1',
      name: 'Critical Site Protection',
      description: 'Strict approval for critical site automations',
      constraints: ['Approval required', 'Max risk: high', 'Max scope: 5 sites'],
      approvalRequired: true,
      maxRiskLevel: 'high'
    },
    {
      id: 'policy_2',
      name: 'Regional Recovery',
      description: 'Auto-approval for regional recovery automations',
      constraints: ['Low risk only', 'Max scope: 100 cells'],
      approvalRequired: false,
      maxRiskLevel: 'low'
    },
    {
      id: 'policy_3',
      name: 'Transport Network',
      description: 'Medium approval threshold for transport changes',
      constraints: ['Approval if risk > medium', 'Max scope: entire region'],
      approvalRequired: true,
      maxRiskLevel: 'medium'
    }
  ];
}

export function getStageColor(stage: ExecutionStage): string {
  const colors: Record<ExecutionStage, string> = {
    detected: 'bg-blue-100 text-blue-800',
    decision: 'bg-purple-100 text-purple-800',
    executed: 'bg-green-100 text-green-800',
    validated: 'bg-emerald-100 text-emerald-800'
  };
  return colors[stage];
}

export function getStatusColor(status: AutomationStatus): string {
  const colors: Record<AutomationStatus, string> = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    rollback: 'bg-red-100 text-red-800',
    failed: 'bg-red-100 text-red-800'
  };
  return colors[status];
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800'
  };
  return colors[risk];
}
