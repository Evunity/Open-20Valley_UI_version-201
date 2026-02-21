import React, { useState } from 'react';
import { ChevronRight, Plus, Network, AlertCircle } from 'lucide-react';
import { AUTOMATION_TEMPLATES, RiskPreview } from '../utils/automationData';

type BuilderMode = 'guided' | 'expert';

interface AutomationBuilderProps {
  onSave?: (automation: any) => void;
  onCancel?: () => void;
}

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ onSave, onCancel }) => {
  const [mode, setMode] = useState<BuilderMode>('guided');
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    scope: 'site',
    action: '',
    approval: false
  });
  const [showRiskPreview, setShowRiskPreview] = useState(false);

  const riskPreview: RiskPreview = {
    estimatedNodesAffected: 182,
    maxSubscribersImpacted: 240000,
    pastFailureRate: 2.1,
    trustScoreProjection: 'HIGH'
  };

  const handleModeSwitch = (newMode: BuilderMode) => {
    setMode(newMode);
    setStep(1);
  };

  const handleStepNext = () => {
    setStep(Math.min(step + 1, 4));
  };

  const handleStepBack = () => {
    setStep(Math.max(step - 1, 1));
  };

  const handleSave = () => {
    setShowRiskPreview(true);
    setTimeout(() => {
      onSave?.({ ...formData, template: selectedTemplate });
      setShowRiskPreview(false);
    }, 2000);
  };

  // GUIDED MODE - Form based
  if (mode === 'guided') {
    return (
      <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
        {/* Mode Switch Header */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
          <button
            onClick={() => handleModeSwitch('guided')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'guided'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Guided Mode
          </button>
          <button
            onClick={() => handleModeSwitch('expert')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'expert'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expert Mode (Graph)
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Step {step} of 4</h2>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition ${
                    s <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {step === 1 && 'Select a template or start from scratch'}
            {step === 2 && 'Define trigger conditions'}
            {step === 3 && 'Configure scope and action'}
            {step === 4 && 'Review and set approval policy'}
          </p>
        </div>

        {/* Step 1: Templates */}
        {step === 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Automation Templates</h3>
            {AUTOMATION_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setFormData(prev => ({ ...prev, name: template.name }));
                  handleStepNext();
                }}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  selectedTemplate === template.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <span className="text-2xl">{template.thumbnail}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Trigger */}
        {step === 2 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Trigger Condition
              </label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select trigger...</option>
                <option value="cpu_threshold">CPU Threshold Exceeded</option>
                <option value="connection_loss">Connection Loss Detected</option>
                <option value="config_drift">Configuration Drift Detected</option>
                <option value="kpi_threshold">KPI Below Baseline</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Scope & Action */}
        {step === 3 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Scope
              </label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="site">Single Site</option>
                <option value="cluster">Cluster</option>
                <option value="region">Region</option>
                <option value="network">Network-wide</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Action
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select action...</option>
                <option value="restart">Restart Service</option>
                <option value="failover">Trigger Failover</option>
                <option value="scale">Scale Resources</option>
                <option value="isolate">Isolate Component</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Approval */}
        {step === 4 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="approval"
                checked={formData.approval}
                onChange={(e) => setFormData(prev => ({ ...prev, approval: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="approval" className="text-sm font-semibold text-gray-900">
                Require approval before execution
              </label>
            </div>
            <p className="text-xs text-gray-600">
              High-risk automations should require manual approval to ensure safety.
            </p>
          </div>
        )}

        {/* Risk Preview */}
        {showRiskPreview && (
          <div className="bg-white rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <h3 className="text-sm font-bold text-amber-900">Risk Preview</h3>
            </div>
            <div className="space-y-2 text-xs text-amber-800">
              <p>✓ Estimated nodes affected: {riskPreview.estimatedNodesAffected}</p>
              <p>✓ Max subscribers impacted: {riskPreview.maxSubscribersImpacted.toLocaleString()}</p>
              <p>✓ Past failure rate: {riskPreview.pastFailureRate}%</p>
              <p className="font-semibold">Trust score: {riskPreview.trustScoreProjection}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={handleStepBack}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={handleStepNext}
                disabled={
                  (step === 1 && !selectedTemplate) ||
                  (step === 2 && !formData.trigger) ||
                  (step === 3 && !formData.action)
                }
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              >
                Save Automation
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EXPERT MODE - Graph Editor Placeholder
  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Mode Switch */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
        <button
          onClick={() => handleModeSwitch('guided')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Guided Mode
        </button>
        <button
          onClick={() => handleModeSwitch('expert')}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition bg-blue-600 text-white"
        >
          Expert Mode (Graph)
        </button>
      </div>

      {/* Graph Editor Placeholder */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center">
        <Network className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-sm font-bold text-gray-900 mb-1">Graph Editor</h3>
        <p className="text-xs text-gray-600 text-center max-w-xs mb-4">
          Advanced workflow editor supporting zoom, pan, parallel branches, conditionals, retries, and timeouts.
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Node
          </button>
          <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
            Load Template
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
        >
          Save Workflow
        </button>
      </div>
    </div>
  );
};
