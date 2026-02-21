import React, { useState } from 'react';
import { AlertTriangle, Users, TrendingDown, DollarSign } from 'lucide-react';

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
  const [selectedService, setSelectedService] = useState('all');

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

  const getImpactColor = (health: string) => {
    switch (health) {
      case 'down': return 'bg-red-100 border-red-300';
      case 'degraded': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getImpactTextColor = (health: string) => {
    switch (health) {
      case 'down': return 'text-red-800';
      case 'degraded': return 'text-yellow-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Impact & Blast Radius Analysis</h2>

      {/* Scenario Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Select Failure Scenario</p>
        <div className="space-y-2">
          {Object.entries(impactScenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setSelectedObject(key)}
              className={`w-full text-left px-3 py-2 rounded border-2 transition ${
                selectedObject === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">{scenario.triggeredBy}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {scenario.totalSubscribersAffected.toLocaleString()} subscribers • ${scenario.estimatedRevenueImpact.toLocaleString()} impact
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Impact Chain */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Impact Propagation Chain</h3>
        <div className="space-y-2">
          {impact.impactChain.map((step, idx) => (
            <div key={idx}>
              <button
                onClick={() => onImpactSelect?.(step.object)}
                className={`w-full text-left px-3 py-2 rounded border-l-4 transition ${getImpactColor(step.health)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${getImpactTextColor(step.health)}`}>
                      Level {step.level}: {step.object}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">{step.impact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{step.count}</p>
                    <p className="text-xs text-gray-600">{step.type}</p>
                  </div>
                </div>
              </button>
              {idx < impact.impactChain.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="text-gray-400">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 rounded-lg border border-red-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-red-600" />
            <p className="text-xs font-semibold text-red-900">Subscribers Impacted</p>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {(impact.totalSubscribersAffected / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg border border-orange-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-semibold text-orange-900">Revenue Impact</p>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            ${(impact.estimatedRevenueImpact / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Affected Services */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Affected Services</p>
        <div className="flex flex-wrap gap-2">
          {impact.affectedServices.map((service, idx) => (
            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-semibold">
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* KPI Degradation */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-3">KPI Degradation</p>
        <div className="space-y-2">
          {Object.entries(impact.kpiDegradation).map(([kpi, degradation]) => (
            <div key={kpi}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700">{kpi}</span>
                <span className="text-xs font-bold text-red-600">-{degradation}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 rounded-full h-full transition"
                  style={{ width: `${Math.min(degradation, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NOC Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900">
            <p className="font-semibold mb-1">For NOC Teams:</p>
            <p>This impact analysis helps understand consequences of failures and prioritize recovery actions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
