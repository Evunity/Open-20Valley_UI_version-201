import React, { useState } from 'react';
import { GitBranch, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { generateMockModelVersions, getModelStageColor, ModelVersion } from '../utils/automationData';

interface ModelGovernanceProps {
  onModelDeploy?: (version: string) => void;
  onModelRollback?: (version: string) => void;
}

export const ModelGovernance: React.FC<ModelGovernanceProps> = ({
  onModelDeploy,
  onModelRollback
}) => {
  const [models, setModels] = useState<ModelVersion[]>(generateMockModelVersions());
  const [selectedVersion, setSelectedVersion] = useState<string>(models[0].version);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(models[0].version);

  const selectedModel = models.find(m => m.version === selectedVersion);
  const activeModel = models.find(m => m.stage === 'active');

  const stages = [
    { id: 'training', label: 'Training', icon: '📚', description: 'Model training in progress' },
    { id: 'testing', label: 'Testing', icon: '🧪', description: 'QA and validation' },
    { id: 'shadow', label: 'Shadow', icon: '👁️', description: 'Running in shadow mode' },
    { id: 'approved', label: 'Approved', icon: '✅', description: 'Ready for production' },
    { id: 'active', label: 'Active', icon: '🚀', description: 'Currently in production' }
  ];

  const getStageIndex = (stage: string) => stages.findIndex(s => s.id === stage);

  const handleRollback = (version: string) => {
    onModelRollback?.(version);
    alert(`Rolled back to model ${version}`);
  };

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">Model Governance</h2>
      </div>

      {/* Lifecycle Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-4">Model Lifecycle</p>
        <div className="flex gap-2">
          {stages.map((stage, idx) => {
            const stageIndex = getStageIndex(stage.id);
            const modelStageIndex = selectedModel ? getStageIndex(selectedModel.stage) : -1;
            const isCompleted = modelStageIndex > stageIndex;
            const isCurrent = modelStageIndex === stageIndex;

            return (
              <div key={stage.id} className="flex-1">
                <button
                  onClick={() => {
                    const versionAtStage = models.find(m => m.stage === stage.id);
                    if (versionAtStage) {
                      setSelectedVersion(versionAtStage.version);
                      setExpandedVersion(versionAtStage.version);
                    }
                  }}
                  className={`w-full text-center px-2 py-2 rounded-lg transition border-2 text-xs font-semibold ${
                    isCompleted || isCurrent
                      ? isCurrent
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-green-100 border-green-500 text-green-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="text-lg mb-0.5">{stage.icon}</div>
                  <p>{stage.label}</p>
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Click a stage to see models at that lifecycle stage
        </p>
      </div>

      {/* Model Versions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-gray-700 mb-3">Model Versions</p>
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {models.map(model => {
            const isActive = model.stage === 'active';
            const isSelected = model.version === selectedVersion;
            const isExpanded = model.version === expandedVersion;

            return (
              <div
                key={model.version}
                className={`rounded-lg border-2 transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => {
                    setSelectedVersion(model.version);
                    setExpandedVersion(
                      isExpanded ? null : model.version
                    );
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/50 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getModelStageColor(model.stage)}`}>
                      {model.stage.toUpperCase()}
                    </span>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-gray-900">v{model.version}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(model.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-xs font-bold text-green-600 flex-shrink-0">● LIVE</span>
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-3 py-3 bg-gray-50 space-y-3 text-xs">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600 font-semibold">Accuracy</p>
                        <p className="text-lg font-bold text-gray-900">{model.accuracy}%</p>
                        <div className="w-full bg-gray-200 rounded h-1.5 mt-1">
                          <div
                            className={`h-full rounded ${
                              model.accuracy >= 93 ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${model.accuracy}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold">Training Data</p>
                        <p className="text-lg font-bold text-gray-900">
                          {(model.trainingDataPoints / 1000).toFixed(0)}K
                        </p>
                        <p className="text-gray-600 mt-1">data points</p>
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    {model.metrics && (
                      <div className="bg-white rounded p-2 border border-gray-200 space-y-1">
                        <p className="font-semibold text-gray-700">Performance Metrics</p>
                        {Object.entries(model.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-semibold text-gray-900">
                              {(value as number * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {model.stage === 'approved' && (
                        <button
                          onClick={() => onModelDeploy?.(model.version)}
                          className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition"
                        >
                          Deploy to Production
                        </button>
                      )}
                      {isActive && (
                        <button
                          onClick={() => handleRollback(model.version)}
                          className="flex-1 px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CI/CD Pipeline Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-900 mb-1">🔄 Model Lifecycle</p>
        <div className="text-xs text-blue-800 space-y-1">
          <p>✓ <strong>Training:</strong> Initial model development</p>
          <p>✓ <strong>Testing:</strong> Validation and QA</p>
          <p>✓ <strong>Shadow:</strong> Running alongside production (no execution)</p>
          <p>✓ <strong>Approved:</strong> Ready for production deployment</p>
          <p>✓ <strong>Active:</strong> Currently making decisions</p>
        </div>
      </div>

      {/* Rollback Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Rollback Policy</p>
        <p className="text-xs text-amber-800">
          One-click rollback to any previous approved model. All model versions retain 30 days of
          decision history.
        </p>
      </div>
    </div>
  );
};
