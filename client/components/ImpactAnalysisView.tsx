import React, { useState } from 'react';
import { AlertTriangle, Users, DollarSign, TrendingDown } from 'lucide-react';

interface ImpactChain {
  level: number;
  object: string;
  type: string;
  impact: string;
  health: 'healthy' | 'degraded' | 'down';
  count: number;
}

interface BlastRadius {
  triggeredBy: string;
  impactChain: ImpactChain[];
  totalSubscribersAffected: number;
  estimatedRevenueImpact: number;
  affectedServices: string[];
  kpiDegradation: Record<string, number>;
}

interface ImpactAnalysisViewProps {
  onImpactSelect?: (object: string) => void;
}

export const ImpactAnalysisView: React.FC<ImpactAnalysisViewProps> = ({ onImpactSelect }) => {
  const [selectedObject, setSelectedObject] = useState('transport_link_01');

  // Mock impact scenarios
  const impactScenarios: Record<string, BlastRadius> = {
    'transport_link_01': {
      triggeredBy: 'Transport Link – Cairo→Alexandria (Fiber)',
      impactChain: [
        {
          level: 0,
          object: 'Transport Link',
          type: 'Link Failure',
          impact: 'Primary fiber link down',
          health: 'down',
          count: 1
        },
        {
          level: 1,
          object: 'Sites Affected',
          type: 'Site',
          impact: 'No redundancy available',
          health: 'down',
          count: 8
        },
        {
          level: 2,
          object: 'Cells Down',
          type: 'Cell',
          impact: 'No backhaul connectivity',
          health: 'down',
          count: 214
        },
        {
          level: 3,
          object: 'Subscribers Impacted',
          type: 'Service',
          impact: 'Unable to connect',
          health: 'down',
          count: 98000
        }
      ],
      totalSubscribersAffected: 98000,
      estimatedRevenueImpact: 245000,
      affectedServices: ['4G', '5G', 'Internet', 'VoIP'],
      kpiDegradation: {
        'Availability': 15.2,
        'Drop Rate': 34.5,
        'Throughput': 65.8,
        'Latency': 45.2
      }
    },
    'rru_failure': {
      triggeredBy: 'RRU 2 Failure – Sector A',
      impactChain: [
        {
          level: 0,
          object: 'RRU Module',
          type: 'Hardware',
          impact: 'Radio module power failure',
          health: 'down',
          count: 1
        },
        {
          level: 1,
          object: 'Cell',
          type: 'Cell',
          impact: 'Sector A coverage lost',
          health: 'down',
          count: 1
        },
        {
          level: 2,
          object: 'Subscribers Impacted',
          type: 'Service',
          impact: 'Coverage hole in sector',
          health: 'degraded',
          count: 12440
        }
      ],
      totalSubscribersAffected: 12440,
      estimatedRevenueImpact: 31100,
      affectedServices: ['4G', '5G'],
      kpiDegradation: {
        'Availability': 2.1,
        'Drop Rate': 8.5,
        'Throughput': 12.3,
        'Latency': 5.6
      }
    },
    'bbu_pool_failure': {
      triggeredBy: 'BBU Pool Overload – Site Cairo-01',
      impactChain: [
        {
          level: 0,
          object: 'BBU Pool',
          type: 'Hardware',
          impact: 'Processing capacity exceeded',
          health: 'degraded',
          count: 2
        },
        {
          level: 1,
          object: 'Cells Degraded',
          type: 'Cell',
          impact: 'Reduced processing capacity',
          health: 'degraded',
          count: 18
        },
        {
          level: 2,
          object: 'Subscribers Degraded',
          type: 'Service',
          impact: 'Reduced throughput, increased latency',
          health: 'degraded',
          count: 54680
        }
      ],
      totalSubscribersAffected: 54680,
      estimatedRevenueImpact: 137200,
      affectedServices: ['4G', 'Internet'],
      kpiDegradation: {
        'Availability': 0.5,
        'Drop Rate': 5.2,
        'Throughput': 42.1,
        'Latency': 28.5
      }
    }
  };

  const impact = impactScenarios[selectedObject];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'down':
        return 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-l-4 border-l-red-600';
      case 'degraded':
        return 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300 border-l-4 border-l-yellow-600';
      default:
        return 'bg-gray-50 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300 border-l-4 border-l-gray-400';
    }
  };

  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'down':
        return 'text-red-600 dark:text-red-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 bg-background overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Impact & Blast Radius Analysis</h2>
        <p className="text-xs text-muted-foreground mt-1">Analyze failure scenarios and their downstream impact</p>
      </div>

      {/* Failure Scenario Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Select Failure Scenario</h3>
        <div className="space-y-2">
          {Object.entries(impactScenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setSelectedObject(key)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                selectedObject === key
                  ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'
                  : 'bg-card border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{scenario.triggeredBy}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {scenario.totalSubscribersAffected.toLocaleString()} subscribers affected • ${scenario.estimatedRevenueImpact.toLocaleString()} impact
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Impact Propagation Chain */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Impact Propagation Chain</h3>
        <div className="space-y-2">
          {impact.impactChain.map((step, idx) => (
            <div key={idx}>
              <button
                onClick={() => onImpactSelect?.(step.object)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${getHealthColor(step.health)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs font-semibold text-muted-foreground">Level {step.level}</p>
                      <p className="font-semibold text-foreground">{step.object}</p>
                    </div>
                    <p className="text-sm text-foreground mt-1">{step.impact}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-foreground">{step.count}</p>
                  </div>
                </div>
              </button>
              {idx < impact.impactChain.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="text-muted-foreground text-sm">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Key Impact Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground">Subscribers Affected</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {(impact.totalSubscribersAffected / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {impact.totalSubscribersAffected.toLocaleString()} total
            </p>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground">Revenue Impact</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${(impact.estimatedRevenueImpact / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated loss
            </p>
          </div>
        </div>
      </div>

      {/* Affected Services */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Affected Services</h3>
        <div className="flex flex-wrap gap-2">
          {impact.affectedServices.map((service, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-semibold"
            >
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* KPI Degradation */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">KPI Degradation</h3>
        <div className="space-y-4">
          {Object.entries(impact.kpiDegradation).map(([kpi, degradation]) => (
            <div key={kpi}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{kpi}</span>
                <span className={`text-sm font-bold ${getHealthStatusColor('down')}`}>-{degradation}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 dark:bg-red-500 rounded-full h-full transition-all"
                  style={{ width: `${Math.min(degradation, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information Box */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-foreground space-y-1">
            <p className="font-semibold">About Impact Analysis</p>
            <p className="text-muted-foreground">
              This analysis simulates the cascading effects of infrastructure failures. Use this to understand blast radius and prioritize recovery actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
