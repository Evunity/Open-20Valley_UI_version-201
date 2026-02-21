import React, { useState } from 'react';
import { AlertCircle, CheckCircle, X, Shield, MapPin, Clock, Users } from 'lucide-react';
import { ApprovalContext } from '../utils/automationData';

interface HumanInLoopDialogProps {
  context: ApprovalContext;
  isOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export const HumanInLoopDialog: React.FC<HumanInLoopDialogProps> = ({
  context,
  isOpen,
  onApprove,
  onReject,
  onClose
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const blastRadiusPercentage = (context.blastRadius / 1000) * 100;
  const riskLevel =
    context.blastRadius > 500
      ? 'HIGH'
      : context.blastRadius > 200
      ? 'MEDIUM'
      : 'LOW';

  const getRiskColor = () => {
    if (riskLevel === 'HIGH') return 'bg-red-50 border-red-300';
    if (riskLevel === 'MEDIUM') return 'bg-amber-50 border-amber-300';
    return 'bg-green-50 border-green-300';
  };

  const getRiskTextColor = () => {
    if (riskLevel === 'HIGH') return 'text-red-700';
    if (riskLevel === 'MEDIUM') return 'text-amber-700';
    return 'text-green-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">Approve Automation Execution</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Automation Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Automation Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Automation</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{context.automationName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Action</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{context.action}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Duration</p>
                <p className="text-sm font-bold text-gray-900 mt-1">~{context.estimatedDuration}s</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Confidence</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        context.confidence >= 90
                          ? 'bg-green-500'
                          : context.confidence >= 75
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${context.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{context.confidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blast Radius */}
          <div className={`rounded-lg border-2 p-4 ${getRiskColor()}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className={`text-sm font-bold ${getRiskTextColor()}`}>Blast Radius Analysis</h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskTextColor()} bg-white border-2 border-current`}>
                {riskLevel} RISK
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-700">Affected Nodes</p>
                <p className="text-sm font-bold text-gray-900">{context.blastRadius}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition ${
                    riskLevel === 'HIGH'
                      ? 'bg-red-500'
                      : riskLevel === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(blastRadiusPercentage, 100)}%` }}
                />
              </div>
            </div>

            <p className={`text-xs ${getRiskTextColor()}`}>
              {riskLevel === 'HIGH'
                ? '⚠️ This action will affect a large portion of the network. Ensure rollback is ready.'
                : riskLevel === 'MEDIUM'
                ? '⚡ This action affects multiple nodes. Verify all safety gates are in place.'
                : '✓ Limited blast radius. Impact is contained.'}
            </p>
          </div>

          {/* Affected Regions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Affected Regions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {context.affectedRegions.map((region, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* Rollback Readiness */}
          <div
            className={`rounded-lg border-2 p-4 ${
              context.rollbackReady
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {context.rollbackReady ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-bold ${context.rollbackReady ? 'text-green-900' : 'text-red-900'}`}>
                  Rollback {context.rollbackReady ? 'Ready' : 'Not Ready'}
                </p>
                <p className={`text-xs mt-1 ${context.rollbackReady ? 'text-green-800' : 'text-red-800'}`}>
                  {context.rollbackReady
                    ? 'Rollback procedure is prepared and ready. You can safely execute this automation.'
                    : 'Rollback is not ready. Do not proceed without ensuring recovery procedures are in place.'}
                </p>
              </div>
            </div>
          </div>

          {/* No Blind Approvals Warning */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Critical Review Checklist</p>
                <p className="text-xs text-amber-800 mt-1">
                  Before approval, verify:
                </p>
                <ul className="text-xs text-amber-800 mt-2 space-y-1 ml-4">
                  <li>✓ Blast radius is acceptable for current network state</li>
                  <li>✓ All affected regions have been reviewed</li>
                  <li>✓ Rollback procedure is ready and tested</li>
                  <li>✓ Confidence threshold meets your standards</li>
                  <li>✓ No maintenance windows overlap with execution</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 mt-1 rounded"
              />
              <span className="text-xs text-gray-700">
                I have reviewed all details above and understand the blast radius, rollback
                readiness, and potential impact. I approve this automation execution.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3 justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={!acknowledged}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve Execution
          </button>
        </div>
      </div>
    </div>
  );
};
