import React, { useState } from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { generateMockDecisionCards } from '../utils/automationData';

interface DecisionCardProps {
  decision: string;
  model: string;
  confidence: number;
  features: string[];
  similarIncidents: number;
  alternatives: string[];
  isPrimary?: boolean;
}

const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  model,
  confidence,
  features,
  similarIncidents,
  alternatives,
  isPrimary = false
}) => (
  <div
    className={`rounded-lg border-2 p-4 ${
      isPrimary
        ? 'border-green-500 bg-green-50 shadow-lg'
        : 'border-gray-200 bg-white hover:border-gray-300'
    } transition`}
  >
    {isPrimary && (
      <div className="mb-2 inline-block px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
        PRODUCTION
      </div>
    )}

    <h3 className="text-sm font-bold text-gray-900 mb-3">{decision}</h3>

    {/* Metadata */}
    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
      <div>
        <p className="text-gray-600 font-semibold">Model</p>
        <p className="text-gray-900 font-mono">{model}</p>
      </div>
      <div>
        <p className="text-gray-600 font-semibold">Confidence</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded h-2">
            <div
              className={`h-full rounded transition ${
                confidence >= 90
                  ? 'bg-green-500'
                  : confidence >= 75
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="font-bold text-gray-900 w-8">{confidence}%</span>
        </div>
      </div>
    </div>

    {/* Features */}
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-700 mb-2">Features Analyzed</p>
      <div className="flex flex-wrap gap-1">
        {features.map((feature, idx) => (
          <span
            key={idx}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>

    {/* Similar Incidents */}
    <div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200">
      <p className="text-xs font-semibold text-gray-700">
        📊 {similarIncidents} similar incidents in history
      </p>
      <p className="text-xs text-gray-600 mt-1">
        Model trained on {similarIncidents * 10}+ related incidents
      </p>
    </div>

    {/* Alternatives */}
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-2">Why not alternatives?</p>
      <ul className="text-xs text-gray-700 space-y-1">
        {alternatives.map((alt, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-red-600 mt-0.5">✗</span>
            <span>{alt}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

interface AIDecisionHubProps {
  onDecisionApprove?: (decision: string) => void;
  onDecisionReject?: (decision: string) => void;
}

export const AIDecisionHub: React.FC<AIDecisionHubProps> = ({
  onDecisionApprove,
  onDecisionReject
}) => {
  const [showShadowMode, setShowShadowMode] = useState(false);
  const decisions = generateMockDecisionCards();

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">AI Decision Hub</h2>
        </div>
        <button
          onClick={() => setShowShadowMode(!showShadowMode)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            showShadowMode
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Shadow Mode {showShadowMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Primary Decision */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700">Production Decision</p>
        <DecisionCard
          decision={decisions[0].decision}
          model={decisions[0].model}
          confidence={decisions[0].confidence}
          features={decisions[0].features}
          similarIncidents={decisions[0].similarIncidents}
          alternatives={decisions[0].alternatives}
          isPrimary={true}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onDecisionApprove?.(decisions[0].decision)}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Approve Execution
        </button>
        <button
          onClick={() => onDecisionReject?.(decisions[0].decision)}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4" /> Reject
        </button>
      </div>

      {/* Shadow Mode Panel */}
      {showShadowMode && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👁️</span>
            <h3 className="text-sm font-bold text-purple-900">Shadow Mode Comparison</h3>
          </div>

          <div className="space-y-3">
            {/* Current Model Recommendation */}
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-2">Model v4 (Candidate)</p>
              <p className="text-xs text-purple-800 mb-2">
                Recommends: <strong>{decisions[0].decision}</strong>
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded h-1.5">
                  <div
                    className="h-full bg-green-500 rounded"
                    style={{ width: '94%' }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900">94%</span>
              </div>
            </div>

            {/* Production Model */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-2">Production Model (v3.5)</p>
              <p className="text-xs text-gray-700 mb-2">
                Recommends: <strong>Do nothing</strong>
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded h-1.5">
                  <div
                    className="h-full bg-gray-400 rounded"
                    style={{ width: '15%' }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900">15%</span>
              </div>
            </div>

            {/* Projected Impact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">Projected Improvement</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">+18% Success Rate</p>
                  <p className="text-xs text-blue-800 mt-1">
                    v4 has learned {decisions.length * 50}+ new patterns since v3.5
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Decisions */}
      {decisions.length > 1 && (
        <>
          <p className="text-xs font-semibold text-gray-700 mt-2">Alternative Decisions</p>
          <div className="space-y-2">
            {decisions.slice(1).map((decision, idx) => (
              <DecisionCard
                key={idx}
                decision={decision.decision}
                model={decision.model}
                confidence={decision.confidence}
                features={decision.features}
                similarIncidents={decision.similarIncidents}
                alternatives={decision.alternatives}
              />
            ))}
          </div>
        </>
      )}

      {/* Explainability Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-auto">
        <p className="text-xs font-semibold text-indigo-900 mb-1">💡 Explainability</p>
        <p className="text-xs text-indigo-800">
          All AI decisions are explainable. Features analyzed, confidence scores, and historical
          precedents are shown to ensure transparency and trust.
        </p>
      </div>
    </div>
  );
};
