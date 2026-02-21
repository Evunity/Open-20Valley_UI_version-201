export type AutomationStatus = 'success' | 'pending' | 'rollback' | 'failed';
export type AutomationType = 'cell_outage_recovery' | 'kpi_degradation' | 'transport_failover' | 'parameter_drift' | 'custom';
export type ExecutionStage = 'detected' | 'decision' | 'executed' | 'validated';
export type TriggerCategory = 'network' | 'performance' | 'predictive' | 'behavioral' | 'external';
export type ModelStage = 'training' | 'testing' | 'shadow' | 'approved' | 'active';

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

export interface Trigger {
  id: string;
  category: TriggerCategory;
  name: string;
  description: string;
  icon: string;
}

export interface ModelVersion {
  version: string;
  stage: ModelStage;
  createdAt: string;
  accuracy: number;
  trainingDataPoints: number;
  metrics?: Record<string, number>;
}

export interface DecisionCard {
  id: string;
  decision: string;
  model: string;
  confidence: number;
  features: string[];
  similarIncidents: number;
  alternatives: string[];
}

export interface ExecutionWave {
  id: string;
  wave: number;
  nodeCount: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'locked';
  progress: number;
}

export const TRIGGER_LIBRARY: Trigger[] = [
  // Network
  { id: 't1', category: 'network', name: 'Alarms', description: 'Critical/Major alarms detected', icon: '🔔' },
  { id: 't2', category: 'network', name: 'Topology Changes', description: 'Network topology modifications', icon: '🔄' },
  // Performance
  { id: 't3', category: 'performance', name: 'KPI Thresholds', description: 'Performance metrics exceed limits', icon: '📈' },
  { id: 't4', category: 'performance', name: 'Counter Anomalies', description: 'Counter value anomalies detected', icon: '⚠️' },
  // Predictive
  { id: 't5', category: 'predictive', name: 'Forecast Breach', description: 'ML forecasts imminent breach', icon: '🔮' },
  { id: 't6', category: 'predictive', name: 'Anomaly Score', description: 'Behavioral anomalies detected', icon: '🤖' },
  // Behavioral
  { id: 't7', category: 'behavioral', name: 'Flapping', description: 'Recurring state changes detected', icon: '📊' },
  { id: 't8', category: 'behavioral', name: 'Recurring Incidents', description: 'Pattern of incidents detected', icon: '🔁' },
  // External
  { id: 't9', category: 'external', name: 'Ticket Created', description: 'External ticket system event', icon: '🎫' },
  { id: 't10', category: 'external', name: 'API Event', description: 'Third-party API trigger', icon: '🔗' }
];

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

export function generateMockDecisionCards(): DecisionCard[] {
  return [
    {
      id: 'decision_1',
      decision: 'Restart DU – Cluster East',
      model: 'v4 (Latest)',
      confidence: 94,
      features: ['CPU > 85%', 'Memory leak detected', 'Response time +240%'],
      similarIncidents: 12,
      alternatives: ['Scale resources', 'Isolate component']
    },
    {
      id: 'decision_2',
      decision: 'Failover Transport Link',
      model: 'v4 (Latest)',
      confidence: 87,
      features: ['Link latency spike', 'Packet loss detected', 'BER threshold exceeded'],
      similarIncidents: 8,
      alternatives: ['Reroute traffic', 'Increase bandwidth']
    }
  ];
}

export function generateMockModelVersions(): ModelVersion[] {
  return [
    {
      version: '4.2.1',
      stage: 'active',
      createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
      accuracy: 94.2,
      trainingDataPoints: 125000,
      metrics: { precision: 0.92, recall: 0.95, f1: 0.935 }
    },
    {
      version: '4.2.0',
      stage: 'approved',
      createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
      accuracy: 93.8,
      trainingDataPoints: 120000,
      metrics: { precision: 0.91, recall: 0.94, f1: 0.925 }
    },
    {
      version: '4.1.5',
      stage: 'shadow',
      createdAt: new Date(Date.now() - 21 * 24 * 3600000).toISOString(),
      accuracy: 92.1,
      trainingDataPoints: 115000
    },
    {
      version: '4.1.4',
      stage: 'testing',
      createdAt: new Date(Date.now() - 28 * 24 * 3600000).toISOString(),
      accuracy: 91.5,
      trainingDataPoints: 110000
    }
  ];
}

export function generateMockExecutionWaves(): ExecutionWave[] {
  return [
    { id: 'wave_1', wave: 1, nodeCount: 5, status: 'completed', progress: 100 },
    { id: 'wave_2', wave: 2, nodeCount: 20, status: 'running', progress: 65 },
    { id: 'wave_3', wave: 3, nodeCount: 50, status: 'locked', progress: 0 }
  ];
}

export function getModelStageColor(stage: ModelStage): string {
  const colors = {
    training: 'bg-blue-100 text-blue-800',
    testing: 'bg-indigo-100 text-indigo-800',
    shadow: 'bg-purple-100 text-purple-800',
    approved: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800'
  };
  return colors[stage];
}

export function getTriggerCategoryColor(category: TriggerCategory): string {
  const colors = {
    network: 'bg-blue-100 text-blue-800',
    performance: 'bg-purple-100 text-purple-800',
    predictive: 'bg-indigo-100 text-indigo-800',
    behavioral: 'bg-amber-100 text-amber-800',
    external: 'bg-pink-100 text-pink-800'
  };
  return colors[category];
}

export interface AutomationLearning {
  automationId: string;
  name: string;
  successRate: number;
  trend: 'improving' | 'stable' | 'degrading';
  trendValue: number; // percentage change
  recommendations: string[];
}

export interface TrustScore {
  overall: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  eligibleForAutonomy: boolean;
  maturityLevel: 'L1' | 'L2' | 'L3' | 'L4';
  nextMilestone: string;
}

export interface ApprovalContext {
  automationName: string;
  action: string;
  blastRadius: number;
  affectedRegions: string[];
  confidence: number;
  rollbackReady: boolean;
  estimatedDuration: number;
}

export interface HeatmapData {
  region: string;
  automationCount: number;
  successRate: number;
  lastHour: number;
}

export interface ROIData {
  downtimeAvoided: number; // hours
  truckRollsPrevented: number;
  revenueProtected: number; // dollars
  periodDays: number;
}

export function generateMockLearningData(): AutomationLearning[] {
  return [
    {
      automationId: 'auto_1',
      name: 'Cell Outage Recovery',
      successRate: 94.2,
      trend: 'improving',
      trendValue: 8.5,
      recommendations: [
        'Increase confidence threshold from 82 → 88%',
        'Reduce timeout window from 45s → 35s',
        'Expand trigger scope to regional level'
      ]
    },
    {
      automationId: 'auto_2',
      name: 'Transport Failover',
      successRate: 87.5,
      trend: 'stable',
      trendValue: 0.2,
      recommendations: []
    },
    {
      automationId: 'auto_3',
      name: 'Parameter Drift Correction',
      successRate: 71.3,
      trend: 'degrading',
      trendValue: -5.2,
      recommendations: [
        'Retrain model with recent data',
        'Reduce max change delta to prevent over-correction'
      ]
    }
  ];
}

export function generateMockTrustScore(): TrustScore {
  return {
    overall: 87,
    level: 'HIGH',
    eligibleForAutonomy: true,
    maturityLevel: 'L3',
    nextMilestone: 'L4 - Full Autonomous Mode (pending audit approval)'
  };
}

export function generateMockHeatmapData(): HeatmapData[] {
  return [
    { region: 'Cairo', automationCount: 145, successRate: 94, lastHour: 23 },
    { region: 'Alexandria', automationCount: 98, successRate: 91, lastHour: 18 },
    { region: 'Giza', automationCount: 156, successRate: 96, lastHour: 31 },
    { region: 'Suez', automationCount: 67, successRate: 88, lastHour: 12 },
    { region: 'Mansoura', automationCount: 89, successRate: 92, lastHour: 15 }
  ];
}

export function generateMockROIData(): ROIData {
  return {
    downtimeAvoided: 187.5,
    truckRollsPrevented: 43,
    revenueProtected: 2450000,
    periodDays: 30
  };
}
