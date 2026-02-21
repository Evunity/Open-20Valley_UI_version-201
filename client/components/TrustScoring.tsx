import React from 'react';
import { Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { generateMockTrustScore, TrustScore } from '../utils/automationData';

export const TrustScoring: React.FC = () => {
  const trustScore = generateMockTrustScore();

  const maturityLevels = [
    {
      level: 'L1',
      name: 'Manual Approval',
      description: 'All automations require human approval',
      completed: true
    },
    {
      level: 'L2',
      name: 'Conditional Autonomy',
      description: 'Auto-execution with guardrails',
      completed: trustScore.maturityLevel >= 'L2'
    },
    {
      level: 'L3',
      name: 'Trust-Based Autonomy',
      description: 'Autonomous with monitoring',
      completed: trustScore.maturityLevel >= 'L3',
      active: trustScore.maturityLevel === 'L3'
    },
    {
      level: 'L4',
      name: 'Full Autonomous',
      description: 'Complete autonomy with self-healing',
      completed: false
    }
  ];

  const getTrustLevelColor = (level: string) => {
    if (level === 'HIGH') return 'text-green-600';
    if (level === 'MEDIUM') return 'text-amber-600';
    return 'text-red-600';
  };

  const getTrustLevelBgColor = (level: string) => {
    if (level === 'HIGH') return 'bg-green-100 text-green-800';
    if (level === 'MEDIUM') return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-900">Trust Score & Autonomy Maturity</h2>
      </div>

      {/* Trust Score Badge */}
      <div className="bg-white rounded-lg border-2 border-indigo-300 p-6 text-center">
        <p className="text-xs text-gray-600 font-semibold mb-2">TRUST LEVEL</p>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-5xl font-black text-indigo-600">{trustScore.overall}</div>
          <div className="text-left">
            <span
              className={`inline-block px-3 py-1.5 rounded-lg font-bold text-sm ${getTrustLevelBgColor(
                trustScore.level
              )}`}
            >
              {trustScore.level}
            </span>
            <p className="text-xs text-gray-600 mt-1">Autonomy eligible</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 font-semibold">
          Eligible for Conditional Autonomy
        </p>
      </div>

      {/* Current Maturity Level */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-indigo-900">Current Maturity</h3>
          <span className="text-lg font-bold text-indigo-600">{trustScore.maturityLevel}</span>
        </div>
        <p className="text-xs text-indigo-800">
          Currently operating at L3 with monitoring enabled. Ready for further autonomy progression.
        </p>
      </div>

      {/* Maturity Roadmap */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-4">Autonomy Maturity Roadmap</p>
        <div className="space-y-3">
          {maturityLevels.map((item, idx) => (
            <div key={item.level}>
              <div
                className={`p-3 rounded-lg border-2 transition ${
                  item.active
                    ? 'border-blue-500 bg-blue-50'
                    : item.completed
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {item.level} - {item.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : item.active ? (
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {item.active && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-900 font-semibold">
                    🎯 Currently at this level
                  </div>
                )}
              </div>

              {/* Progress arrow */}
              {idx < maturityLevels.length - 1 && (
                <div className="flex justify-center py-1">
                  <div
                    className={`text-lg ${
                      item.completed || item.active ? 'text-green-500' : 'text-gray-300'
                    }`}
                  >
                    ▼
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg mt-0.5">🚀</span>
          <div>
            <p className="text-sm font-bold text-amber-900">Next Milestone</p>
            <p className="text-xs text-amber-800 mt-1">{trustScore.nextMilestone}</p>
            <p className="text-xs text-amber-700 mt-2">
              Requires: Audit approval from telecom oversight team
            </p>
          </div>
        </div>
      </div>

      {/* Trust Factors */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-3">Trust Factors</p>
        <div className="space-y-2">
          {[
            { factor: 'Success Rate', score: 94, icon: '✓' },
            { factor: 'Rollback Availability', score: 100, icon: '🔄' },
            { factor: 'Monitoring Coverage', score: 98, icon: '📊' },
            { factor: 'Policy Compliance', score: 95, icon: '📋' },
            { factor: 'Historical Performance', score: 87, icon: '📈' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm">{item.icon}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-700 font-medium">{item.factor}</p>
                <div className="w-full bg-gray-200 rounded h-1 mt-1">
                  <div
                    className={`h-full rounded transition ${
                      item.score >= 95
                        ? 'bg-green-500'
                        : item.score >= 85
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-900 w-8 text-right">{item.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-900 mb-1">ℹ️ About Trust Scoring</p>
        <p className="text-xs text-blue-800">
          Trust scores are calculated continuously based on automation performance, compliance with
          policies, and successful execution history. Higher trust enables progression to higher
          autonomy maturity levels.
        </p>
      </div>
    </div>
  );
};
