import React, { useState } from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle, BarChart2 } from 'lucide-react';
import { generateMockDecisionCards, DecisionCard as DecisionCardType } from '../utils/automationData';

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
    className={`rounded-lg border-2 p-4 transition ${
      isPrimary
        ? 'border-primary bg-primary/5'
        : 'border-border bg-card hover:border-primary/50'
    }`}
  >
    {isPrimary && (
      <div className="mb-2 inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">
        PRODUCTION
      </div>
    )}

    <h3 className="text-sm font-bold text-foreground mb-3">{decision}</h3>

    {/* Metadata */}
    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
      <div>
        <p className="text-muted-foreground font-semibold">Model</p>
        <p className="text-foreground font-mono">{model}</p>
      </div>
      <div>
        <p className="text-muted-foreground font-semibold">Confidence</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-border rounded h-2">
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
          <span className="font-bold text-foreground w-8">{confidence}%</span>
        </div>
      </div>
    </div>

    {/* Features */}
    <div className="mb-4">
      <p className="text-xs font-semibold text-muted-foreground mb-2">Features Analyzed</p>
      <div className="flex flex-wrap gap-1">
        {features.map((feature, idx) => (
          <span
            key={idx}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>

    {/* Similar Incidents */}
    <div className="mb-4 p-2 bg-muted rounded border border-border">
      <p className="text-xs font-semibold text-foreground">
        📊 {similarIncidents} similar incidents in history
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Model trained on {similarIncidents * 10}+ related incidents
      </p>
    </div>

    {/* Alternatives */}
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2">Why not alternatives?</p>
      <ul className="text-xs text-foreground space-y-1">
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
  const initialDecisions = generateMockDecisionCards();
  const [pendingDecisions, setPendingDecisions] = useState<DecisionCardType[]>(initialDecisions || []);
  const [approvedDecisions, setApprovedDecisions] = useState<DecisionCardType[]>([]);
  const [rejectedDecisions, setRejectedDecisions] = useState<DecisionCardType[]>([]);
  const [showAllDecisions, setShowAllDecisions] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const handleApprove = (decision: DecisionCardType) => {
    if (!decision) return;
    const approvedDecision: DecisionCardType = { ...decision, id: `approved_${decision.id}` };
    setPendingDecisions(prev => prev.filter(d => d.id !== decision.id) || []);
    setApprovedDecisions(prev => [...(prev || []), approvedDecision]);
    onDecisionApprove?.(decision.decision);
  };

  const handleReject = (decision: DecisionCardType) => {
    if (!decision) return;
    const rejectedDecision: DecisionCardType = { ...decision, id: `rejected_${decision.id}` };
    setPendingDecisions(prev => prev.filter(d => d.id !== decision.id) || []);
    setRejectedDecisions(prev => [...(prev || []), rejectedDecision]);
    onDecisionReject?.(decision.decision);
  };

  return (
    <div className="w-full flex flex-col h-full gap-4 p-4 bg-background overflow-y-auto">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setShowHistory(true)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-card text-foreground border border-border hover:bg-muted transition"
        >
          📋 History
        </button>
        {pendingDecisions.length > 3 && (
          <button
            onClick={() => setShowAllDecisions(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-card text-foreground border border-border hover:bg-muted transition"
          >
            Show All ({pendingDecisions.length})
          </button>
        )}
      </div>

      {/* No Decisions Message */}
      {!pendingDecisions || pendingDecisions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground mb-2">✓ No decisions pending</p>
            <p className="text-sm text-muted-foreground">All decisions have been reviewed</p>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Decision */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground">Production Decision</p>

            {/* Decision Card */}
            {pendingDecisions && pendingDecisions[0] && (
            <DecisionCard
              decision={pendingDecisions[0].decision}
              model={pendingDecisions[0].model}
              confidence={pendingDecisions[0].confidence}
              features={pendingDecisions[0].features}
              similarIncidents={pendingDecisions[0].similarIncidents}
              alternatives={pendingDecisions[0].alternatives}
              isPrimary={true}
            />
            )}

            {/* Shadow Mode Comparison - Always Visible */}
            {pendingDecisions && pendingDecisions[0] && (
            <>
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">👁️</span>
                <h3 className="text-sm font-bold text-foreground">Model Comparison</h3>
              </div>

              <div className="space-y-2 text-xs">
                {/* Current Model Recommendation */}
                <div className="bg-muted rounded p-2 border border-border">
                  <p className="font-semibold text-foreground mb-1">Latest Model v4</p>
                  <p className="text-muted-foreground mb-1">
                    Recommends: <strong className="text-foreground">{pendingDecisions[0].decision}</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-border rounded h-1.5">
                      <div
                        className="h-full bg-primary rounded"
                        style={{ width: `${pendingDecisions[0].confidence}%` }}
                      />
                    </div>
                    <span className="font-bold text-foreground w-8">{pendingDecisions[0].confidence}%</span>
                  </div>
                </div>

                {/* Production Model */}
                <div className="bg-muted rounded p-2 border border-border">
                  <p className="font-semibold text-foreground mb-1">Production Model v3.5</p>
                  <p className="text-muted-foreground mb-1">
                    Recommends: <strong className="text-foreground">Review & Wait</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-border rounded h-1.5">
                      <div
                        className="h-full bg-amber-500 rounded"
                        style={{ width: '35%' }}
                      />
                    </div>
                    <span className="font-bold text-foreground w-8">35%</span>
                  </div>
                </div>

                {/* Projected Impact */}
                <div className="bg-primary/5 border border-primary/20 rounded p-2">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Projected Improvement</p>
                      <p className="text-primary font-bold mt-1">+18% Success Rate</p>
                      <p className="text-muted-foreground mt-1">
                        v4 has learned 750+ new patterns since v3.5
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(pendingDecisions[0])}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Approve Execution
              </button>
              <button
                onClick={() => handleReject(pendingDecisions[0])}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-destructive-foreground bg-destructive hover:bg-destructive/90 transition flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> Reject
              </button>
            </div>
            </>
            )}
          </div>

          {/* Alternative Decisions - Only if more than 1 */}
          {pendingDecisions && Array.isArray(pendingDecisions) && pendingDecisions.length > 1 && (
            <>
              <p className="text-xs font-semibold text-foreground mt-4">Alternative Decisions</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pendingDecisions.slice(1, 3).map((decision, idx) => (
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
        </>
      )}

      {/* Explainability Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-auto">
        <p className="text-xs font-semibold text-foreground mb-1">💡 Explainability</p>
        <p className="text-xs text-muted-foreground">
          All AI decisions are explainable. Features analyzed, confidence scores, and historical
          precedents are shown to ensure transparency and trust.
        </p>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Decision History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 p-4">
              {approvedDecisions && Array.isArray(approvedDecisions) && approvedDecisions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" /> Approved ({approvedDecisions.length})
                  </p>
                  <div className="space-y-1 mb-3">
                    {approvedDecisions.map(d => (
                      <div key={d.id} className="text-xs p-2 bg-muted rounded border border-green-500/20">
                        <p className="font-semibold text-foreground">{d.decision}</p>
                        <p className="text-muted-foreground">Confidence: {d.confidence}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rejectedDecisions && Array.isArray(rejectedDecisions) && rejectedDecisions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" /> Rejected ({rejectedDecisions.length})
                  </p>
                  <div className="space-y-1">
                    {rejectedDecisions.map(d => (
                      <div key={d.id} className="text-xs p-2 bg-muted rounded border border-red-500/20">
                        <p className="font-semibold text-foreground">{d.decision}</p>
                        <p className="text-muted-foreground">Confidence: {d.confidence}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {approvedDecisions.length === 0 && rejectedDecisions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No decision history yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Decisions Modal */}
      {showAllDecisions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">All Pending Decisions</h2>
              <button
                onClick={() => setShowAllDecisions(false)}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 p-4">
              {pendingDecisions && Array.isArray(pendingDecisions) && pendingDecisions.map((decision, idx) => (
                <div key={idx} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{decision.decision}</p>
                      <p className="text-xs text-muted-foreground">Confidence: {decision.confidence}%</p>
                    </div>
                    {idx === 0 && (
                      <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleApprove(decision);
                        setShowAllDecisions(false);
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(decision);
                        setShowAllDecisions(false);
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
