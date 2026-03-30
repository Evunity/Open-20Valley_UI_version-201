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

  const getHealthIndicator = (health: string) => {
    switch (health) {
      case 'down':
        return 'bg-red-600';
      case 'degraded':
        return 'bg-amber-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'down':
        return 'Critical';
      case 'degraded':
        return 'Degraded';
      default:
        return 'Healthy';
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 bg-background overflow-y-auto">

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Left: Scenario Selector */}
        <div className="col-span-1 border-r border-border pr-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Failure Scenarios</h3>
          <div className="space-y-2">
            {Object.entries(impactScenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setSelectedObject(key)}
                className={`w-full text-left px-3 py-3 rounded border transition ${
                  selectedObject === key
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-600'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <p className="text-sm font-medium text-foreground line-clamp-2">{scenario.triggeredBy}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {scenario.totalSubscribersAffected.toLocaleString()} affected
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Impact Details */}
        <div className="col-span-2 flex flex-col gap-8">
          {/* Impact Chain */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Impact Chain</h3>
            <div className="space-y-3">
              {impact.impactChain.map((step, idx) => (
                <div key={idx}>
                  <div
                    onClick={() => onImpactSelect?.(step.object)}
                    className="p-3 rounded border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getHealthIndicator(step.health)}`}></div>
                          <span className="text-xs font-semibold text-muted-foreground">Level {step.level}</span>
                          <span className="text-xs font-medium text-foreground">{getHealthLabel(step.health)}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground mt-1">{step.object}</p>
                        <p className="text-xs text-muted-foreground mt-1">{step.impact}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-foreground">{step.count}</p>
                        <p className="text-xs text-muted-foreground">{step.type}</p>
                      </div>
                    </div>
                  </div>
                  {idx < impact.impactChain.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-3 bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-muted-foreground font-medium">Subscribers Affected</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {(impact.totalSubscribersAffected / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-muted-foreground font-medium">Revenue Impact</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  ${(impact.estimatedRevenueImpact / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>

          {/* Services & KPIs */}
          <div className="grid grid-cols-2 gap-6">
            {/* Affected Services */}
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Services</h4>
              <div className="flex flex-wrap gap-2">
                {impact.affectedServices.map((service, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-foreground"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* KPI Summary */}
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">KPI Impact</h4>
              <div className="space-y-2">
                {Object.entries(impact.kpiDegradation).slice(0, 2).map(([kpi, degradation]) => (
                  <div key={kpi} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{kpi}</span>
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">-{degradation}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">Note:</span> Impact analysis simulates cascading failures. Results are based on current topology and configuration.
        </p>
      </div>
    </div>
  );
};
