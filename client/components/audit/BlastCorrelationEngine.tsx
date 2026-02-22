import { GitBranch, AlertTriangle, Zap, TrendingUp, Link2 } from 'lucide-react';
import { useState } from 'react';

interface CorrelationLink {
  source: string;
  target: string;
  causality: 'direct' | 'indirect' | 'temporal';
  confidence: number;
  description: string;
}

interface BlastEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  actor: string;
  description: string;
  impact: string;
}

export default function BlastCorrelationEngine() {
  const [selectedChain, setSelectedChain] = useState<string>('chain-1');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const correlationChains = [
    {
      id: 'chain-1',
      name: 'Privilege Escalation → Config Change → Alarm Storm',
      severity: 'critical',
      eventCount: 5,
      timeWindow: '4 minutes',
      rootCause: 'Unauthorized privilege escalation',
      impact: '$127K revenue impact',
      confidence: 98
    },
    {
      id: 'chain-2',
      name: 'Policy Change → Automation Rule → Load Distribution Error',
      severity: 'high',
      eventCount: 4,
      timeWindow: '12 minutes',
      rootCause: 'Overly broad policy change',
      impact: '$45K revenue impact',
      confidence: 94
    },
    {
      id: 'chain-3',
      name: 'AI Decision → Beam Switching → Interference Pattern',
      severity: 'high',
      eventCount: 3,
      timeWindow: '6 minutes',
      rootCause: 'AI model prediction anomaly',
      impact: '$23K revenue impact',
      confidence: 87
    }
  ];

  const blastChains: Record<string, { links: CorrelationLink[]; events: BlastEvent[] }> = {
    'chain-1': {
      links: [
        {
          source: 'EVT-001',
          target: 'EVT-002',
          causality: 'direct',
          confidence: 98,
          description: 'rf_engineer escalates to system_admin'
        },
        {
          source: 'EVT-002',
          target: 'EVT-003',
          causality: 'direct',
          confidence: 99,
          description: 'Admin modifies frequency band policy'
        },
        {
          source: 'EVT-003',
          target: 'EVT-004',
          causality: 'indirect',
          confidence: 94,
          description: 'Automation rule activates new frequency band'
        },
        {
          source: 'EVT-004',
          target: 'EVT-005',
          causality: 'temporal',
          confidence: 92,
          description: 'Interference triggers alarm storm across 847 cells'
        }
      ],
      events: [
        {
          id: 'EVT-001',
          type: 'PRIVILEGE_ESCALATION',
          severity: 'critical',
          timestamp: '14:32:15',
          actor: 'rf_engineer',
          description: 'Engineer elevated to system_admin',
          impact: 'Unrestricted policy modification access'
        },
        {
          id: 'EVT-002',
          type: 'POLICY_CHANGE',
          severity: 'critical',
          timestamp: '14:32:47',
          actor: 'system_admin',
          description: 'Frequency band policy modified (Band 7 → Band 7+20)',
          impact: 'Enables unvalidated frequency configuration'
        },
        {
          id: 'EVT-003',
          type: 'AUTOMATION_RULE',
          severity: 'high',
          timestamp: '14:33:12',
          actor: 'automation_engine',
          description: 'Policy-triggered automation activates new frequency band',
          impact: 'Unvetted carrier frequency rollout'
        },
        {
          id: 'EVT-004',
          type: 'CONFIG_CHANGE',
          severity: 'high',
          timestamp: '14:33:28',
          actor: 'automation_engine',
          description: 'Beam switching enabled on 1,247 sites',
          impact: 'Load distribution recalculation across network'
        },
        {
          id: 'EVT-005',
          type: 'ALARM_STORM',
          severity: 'critical',
          timestamp: '14:33:45',
          actor: 'alarm_system',
          description: '847 cells report interference events',
          impact: '$127K estimated revenue impact in 20 minutes'
        }
      ]
    },
    'chain-2': {
      links: [
        {
          source: 'EVT-101',
          target: 'EVT-102',
          causality: 'direct',
          confidence: 96,
          description: 'Compliance policy updated globally'
        },
        {
          source: 'EVT-102',
          target: 'EVT-103',
          causality: 'direct',
          confidence: 91,
          description: 'Automation rule reconfigured'
        },
        {
          source: 'EVT-103',
          target: 'EVT-104',
          causality: 'indirect',
          confidence: 88,
          description: 'Load balancing weights adjusted'
        }
      ],
      events: [
        {
          id: 'EVT-101',
          type: 'POLICY_CHANGE',
          severity: 'high',
          timestamp: '14:15:22',
          actor: 'compliance_officer',
          description: 'Policy: All carriers must be load-balanced equally',
          impact: 'Overrides engineering optimization rules'
        },
        {
          id: 'EVT-102',
          type: 'AUTOMATION_RULE',
          severity: 'high',
          timestamp: '14:15:54',
          actor: 'automation_engine',
          description: 'Automation redistributes load across all carriers',
          impact: 'Network-wide load change'
        },
        {
          id: 'EVT-103',
          type: 'CONFIG_CHANGE',
          severity: 'medium',
          timestamp: '14:16:18',
          actor: 'automation_engine',
          description: '34,126 configuration changes deployed',
          impact: 'Unexpected traffic shift'
        },
        {
          id: 'EVT-104',
          type: 'PERFORMANCE_ALERT',
          severity: 'high',
          timestamp: '14:16:45',
          actor: 'monitoring',
          description: 'Network latency spike detected',
          impact: '$45K impact'
        }
      ]
    },
    'chain-3': {
      links: [
        {
          source: 'EVT-201',
          target: 'EVT-202',
          causality: 'indirect',
          confidence: 89,
          description: 'AI decision triggers configuration'
        },
        {
          source: 'EVT-202',
          target: 'EVT-203',
          causality: 'temporal',
          confidence: 84,
          description: 'Interference pattern emerges'
        }
      ],
      events: [
        {
          id: 'EVT-201',
          type: 'AI_DECISION',
          severity: 'medium',
          timestamp: '14:08:33',
          actor: 'ml_model_v3.2',
          description: 'AI recommends aggressive beam switching for capacity',
          impact: 'Unvalidated optimization'
        },
        {
          id: 'EVT-202',
          type: 'CONFIG_CHANGE',
          severity: 'high',
          timestamp: '14:09:05',
          actor: 'automation_engine',
          description: 'Beam switching activated cluster-wide',
          impact: 'Potential interference risk'
        },
        {
          id: 'EVT-203',
          type: 'INTERFERENCE_ALERT',
          severity: 'high',
          timestamp: '14:09:47',
          actor: 'spectrum_monitoring',
          description: 'Interference pattern detected in adjacent frequencies',
          impact: '$23K revenue impact'
        }
      ]
    }
  };

  const currentChain = correlationChains.find((c) => c.id === selectedChain)!;
  const chainDetails = blastChains[selectedChain];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-700';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getCausalityIcon = (causality: string) => {
    switch (causality) {
      case 'direct':
        return '→';
      case 'indirect':
        return '⤳';
      case 'temporal':
        return '⇝';
      default:
        return '→';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-600" />
          Blast Correlation Engine
        </h3>
        <p className="text-sm text-muted-foreground">
          Automatically link event chains to reveal causal relationships. Track how a single action cascades into major incidents affecting revenue and network stability.
        </p>
      </div>

      {/* Chain Selection */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          Incident Correlation Chains
        </h3>

        <div className="space-y-2">
          {correlationChains.map((chain) => (
            <div
              key={chain.id}
              onClick={() => setSelectedChain(chain.id)}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${selectedChain === chain.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{chain.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityBadge(chain.severity)}`}>
                      {chain.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{chain.description || ''}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{chain.eventCount}</span> events
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{chain.timeWindow}</span> window
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{chain.confidence}%</span> confidence
                    </span>
                    <span className="text-red-700">
                      <span className="font-semibold">{chain.impact}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chain Details */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Event Correlation Chain
          </h3>
          <div className="text-xs">
            <span className="text-muted-foreground">Root Cause: </span>
            <span className="font-semibold text-foreground">{currentChain.rootCause}</span>
          </div>
        </div>

        {/* Chain visualization */}
        <div className="space-y-3 mb-6">
          {chainDetails.links.map((link, index) => {
            const sourceEvent = chainDetails.events.find((e) => e.id === link.source);
            const targetEvent = chainDetails.events.find((e) => e.id === link.target);

            return (
              <div key={index} className="space-y-2">
                {/* Source event */}
                {index === 0 && sourceEvent && (
                  <div
                    onClick={() => setExpandedEvent(expandedEvent === sourceEvent.id ? null : sourceEvent.id)}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${getSeverityColor(sourceEvent.severity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{sourceEvent.id}</p>
                        <p className="text-sm mt-1">{sourceEvent.description}</p>
                        {expandedEvent === sourceEvent.id && (
                          <p className="text-xs mt-2 opacity-70">Impact: {sourceEvent.impact}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityBadge(sourceEvent.severity)}`}>
                        {sourceEvent.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Arrow and link info */}
                <div className="flex items-center justify-between px-4 text-xs">
                  <span className="text-muted-foreground">{getCausalityIcon(link.causality)}</span>
                  <div className="flex-1 mx-3">
                    <p className="text-muted-foreground text-center">{link.description}</p>
                    <p className="text-center text-xs mt-1">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className={`font-bold ml-1 ${link.confidence >= 95 ? 'text-green-700' : link.confidence >= 85 ? 'text-yellow-700' : 'text-orange-700'}`}>
                        {link.confidence}%
                      </span>
                    </p>
                  </div>
                  <span className="text-muted-foreground">{getCausalityIcon(link.causality)}</span>
                </div>

                {/* Target event */}
                {targetEvent && (
                  <div
                    onClick={() => setExpandedEvent(expandedEvent === targetEvent.id ? null : targetEvent.id)}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${getSeverityColor(targetEvent.severity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{targetEvent.id}</p>
                        <p className="text-sm mt-1">{targetEvent.description}</p>
                        {expandedEvent === targetEvent.id && (
                          <p className="text-xs mt-2 opacity-70">Impact: {targetEvent.impact}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityBadge(targetEvent.severity)}`}>
                        {targetEvent.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Summary */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Blast Impact Analysis
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-700 mb-1">Revenue Impact</p>
              <p className="text-xl font-bold text-red-700">{currentChain.impact}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-border/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Time to Propagation</p>
              <p className="text-xl font-bold text-foreground">{currentChain.timeWindow}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-700 mb-2">Root Cause</p>
            <p className="text-sm text-blue-700 font-semibold">{currentChain.rootCause}</p>
            <p className="text-xs text-blue-600 mt-2">
              This single action triggered a cascading failure affecting {currentChain.eventCount} critical systems within {currentChain.timeWindow}.
            </p>
          </div>
        </div>
      </div>

      {/* Mitigation Recommendations */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Mitigation Strategy
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Require approval workflows</span> for privilege escalations with mandatory review period
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Implement policy change gates</span> with automated impact prediction
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Add automation circuit breakers</span> to prevent cascade failures
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Validate all frequency changes</span> against interference prediction models
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
