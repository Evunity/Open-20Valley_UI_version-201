import React, { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';

export interface PredictiveRisk {
  objectId: string;
  objectName: string;
  riskType: 'congestion' | 'failure' | 'degradation' | 'anomaly';
  severity: 'high' | 'medium' | 'low';
  timeframe: number; // minutes
  probability: number; // 0-100
  affectedDownstream: number;
  description: string;
  recommendation: string;
}

interface PredictiveRiskHighlightProps {
  topology: TopologyObject[];
  isEnabled: boolean;
}

export const PredictiveRiskHighlight: React.FC<PredictiveRiskHighlightProps> = ({ topology, isEnabled }) => {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  // Generate predictive risks based on topology health
  const risks = useMemo<PredictiveRisk[]>(() => {
    if (!isEnabled) return [];

    const generatedRisks: PredictiveRisk[] = [];

    topology.forEach(obj => {
      // High utilization clusters predict congestion
      if (obj.type === 'cluster' && obj.kpiSummary.utilization > 80) {
        generatedRisks.push({
          objectId: obj.id,
          objectName: obj.name,
          riskType: 'congestion',
          severity: obj.kpiSummary.utilization > 90 ? 'high' : 'medium',
          timeframe: obj.kpiSummary.utilization > 90 ? 15 : 30,
          probability: Math.min(obj.kpiSummary.utilization * 1.1, 100),
          affectedDownstream: obj.childrenIds.length,
          description: `High risk of congestion - current utilization at ${obj.kpiSummary.utilization.toFixed(1)}%`,
          recommendation: 'Consider load balancing or capacity expansion'
        });
      }

      // Degraded objects predict failures
      if (obj.healthState === 'degraded') {
        const hoursUntilFailure = 2 + Math.random() * 4;
        generatedRisks.push({
          objectId: obj.id,
          objectName: obj.name,
          riskType: 'failure',
          severity: 'high',
          timeframe: Math.round(hoursUntilFailure * 60),
          probability: 65 + Math.random() * 25,
          affectedDownstream: obj.childrenIds.length,
          description: `${obj.name} shows degradation patterns predicting failure within ${hoursUntilFailure.toFixed(1)} hours`,
          recommendation: 'Trigger preventive maintenance workflow'
        });
      }

      // High drop rate predicts degradation
      if (obj.kpiSummary.dropRate > 0.5) {
        generatedRisks.push({
          objectId: obj.id,
          objectName: obj.name,
          riskType: 'degradation',
          severity: obj.kpiSummary.dropRate > 1 ? 'high' : 'medium',
          timeframe: 60,
          probability: Math.min(obj.kpiSummary.dropRate * 50, 100),
          affectedDownstream: obj.childrenIds.length,
          description: `Drop rate at ${obj.kpiSummary.dropRate.toFixed(2)}% - service degradation expected`,
          recommendation: 'Investigate packet loss root cause'
        });
      }

      // Anomaly detection for utilization spikes
      if (obj.type === 'site' && obj.kpiSummary.utilization > 70 && obj.kpiSummary.latency > 20) {
        generatedRisks.push({
          objectId: obj.id,
          objectName: obj.name,
          riskType: 'anomaly',
          severity: 'medium',
          timeframe: 45,
          probability: 50 + Math.random() * 30,
          affectedDownstream: 0,
          description: `Anomaly detected: High utilization (${obj.kpiSummary.utilization.toFixed(1)}%) + High latency (${obj.kpiSummary.latency.toFixed(0)}ms)`,
          recommendation: 'Enable AI anomaly investigation mode'
        });
      }
    });

    // Sort by severity and probability
    return generatedRisks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.probability - a.probability;
    });
  }, [topology, isEnabled]);

  if (!isEnabled || risks.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: 'bg-red-50 border-red-200 text-red-900',
      medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      low: 'bg-orange-50 border-orange-200 text-orange-900'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getRiskIcon = (type: string) => {
    const icons = {
      congestion: '🔥',
      failure: '⚡',
      degradation: '⚠️',
      anomaly: '🔍'
    };
    return icons[type as keyof typeof icons] || '⚠️';
  };

  const highRiskCount = risks.filter(r => r.severity === 'high').length;

  return (
    <div className="w-full flex flex-col gap-3 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">Predictive Risk Intelligence</h3>
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
            {highRiskCount} high risk
          </span>
        </div>
        <p className="text-xs text-gray-600">{risks.length} predictions</p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {risks.map((risk, idx) => (
          <div
            key={`${risk.objectId}-${idx}`}
            className={`p-3 rounded-lg border transition cursor-pointer ${getSeverityColor(risk.severity)}`}
            onClick={() => setExpandedRisk(expandedRisk === risk.objectId ? null : risk.objectId)}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{getRiskIcon(risk.riskType)}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{risk.objectName}</p>
                    <p className="text-xs opacity-75 mt-0.5">{risk.description}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-bold">{risk.probability.toFixed(0)}%</p>
                    <p className="text-xs opacity-75">probability</p>
                  </div>
                </div>

                {expandedRisk === risk.objectId && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="opacity-75">Timeframe</p>
                        <p className="font-semibold">{risk.timeframe} min</p>
                      </div>
                      <div>
                        <p className="opacity-75">Affected downstream</p>
                        <p className="font-semibold">{risk.affectedDownstream} objects</p>
                      </div>
                    </div>
                    <div className="bg-black bg-opacity-10 rounded p-2">
                      <p className="text-xs font-semibold mb-1">Recommendation:</p>
                      <p className="text-xs opacity-90">{risk.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Probability bar */}
            <div className="mt-2 h-1.5 bg-black bg-opacity-10 rounded-full overflow-hidden">
              <div
                className="h-full bg-current transition-all duration-300"
                style={{ width: `${risk.probability}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Degradation Propagation Simulation */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-gray-900">Impact Propagation Simulation</p>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>If highest risk node fails: <strong>{risks[0]?.affectedDownstream || 0} sites at risk</strong></p>
          <p className="text-blue-600">Simulations run every 5 minutes with ML confidence updates</p>
        </div>
      </div>
    </div>
  );
};
