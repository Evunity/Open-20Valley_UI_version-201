import { AlertTriangle, CheckCircle, XCircle, Lock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ComplianceRule {
  id: string;
  name: string;
  category: string;
  description: string;
  preventedCombination: string[];
  severity: 'critical' | 'high' | 'medium';
  example: string;
  enforcement: string;
  status: 'active' | 'monitored';
}

export default function SeparationOfDuties() {
  const [selectedRule, setSelectedRule] = useState<string>('rule-1');

  const complianceRules: ComplianceRule[] = [
    {
      id: 'rule-1',
      name: 'Automation Creator-Approver Separation',
      category: 'Automation',
      description: 'User cannot create AND approve the same automation',
      preventedCombination: ['create_automation', 'approve_automation'],
      severity: 'critical',
      example: 'Developer A cannot be sole approver for automation they created',
      enforcement: 'System prevents same user from both creating and approving same automation within 72 hours',
      status: 'active'
    },
    {
      id: 'rule-2',
      name: 'Policy Modifier-Auditor Separation',
      category: 'Policy',
      description: 'User cannot modify AND audit same policy',
      preventedCombination: ['modify_policy', 'audit_policy'],
      severity: 'critical',
      example: 'Admin who changes security policy cannot audit their own changes',
      enforcement: 'Different user must audit policy changes made by another',
      status: 'active'
    },
    {
      id: 'rule-3',
      name: 'Script Developer-Executor Separation',
      category: 'Scripts',
      description: 'User cannot develop AND execute own scripts in production',
      preventedCombination: ['create_script', 'execute_script_production'],
      severity: 'high',
      example: 'Developer cannot both write and run production scripts without peer review',
      enforcement: 'Script must be reviewed and executed by different user',
      status: 'active'
    },
    {
      id: 'rule-4',
      name: 'Configuration Changer-Validator Separation',
      category: 'Configuration',
      description: 'User cannot change AND validate same configuration',
      preventedCombination: ['modify_config', 'validate_config'],
      severity: 'high',
      example: 'Network engineer cannot both change RF parameters and validate the changes',
      enforcement: 'Independent validator must approve configuration changes',
      status: 'active'
    },
    {
      id: 'rule-5',
      name: 'Alarm Creator-Acknowledger Separation',
      category: 'Alarms',
      description: 'User cannot create AND clear same alarm',
      preventedCombination: ['create_alarm_rule', 'clear_alarm'],
      severity: 'medium',
      example: 'NOC operator cannot suppress alarm they created to hide issues',
      enforcement: 'Different operator must acknowledge/clear alarms from different rule creators',
      status: 'monitored'
    },
    {
      id: 'rule-6',
      name: 'Access Granter-Revoker Separation',
      category: 'Access Control',
      description: 'User cannot grant AND revoke same access for same period',
      preventedCombination: ['grant_access', 'revoke_access'],
      severity: 'critical',
      example: 'Admin cannot grant user access and then immediately revoke it (approval evasion)',
      enforcement: 'Different admin must approve access revocations for accesses granted by another',
      status: 'active'
    },
    {
      id: 'rule-7',
      name: 'Transaction Initiator-Approver Separation',
      category: 'Financial',
      description: 'User cannot initiate AND approve significant transactions',
      preventedCombination: ['initiate_transaction', 'approve_transaction'],
      severity: 'critical',
      example: 'User cannot request and approve their own budget allocations or resource purchases',
      enforcement: 'Independent approval required for all initiated transactions',
      status: 'active'
    },
    {
      id: 'rule-8',
      name: 'Change Proposer-Authority Separation',
      category: 'Change Management',
      description: 'User cannot propose AND approve their own changes',
      preventedCombination: ['propose_change', 'approve_change'],
      severity: 'high',
      example: 'Engineer cannot propose network change and be the sole approver',
      enforcement: 'Change approval authority must be independent of proposer',
      status: 'active'
    }
  ];

  const currentRule = complianceRules.find(r => r.id === selectedRule);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-700';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Separation of Duties (Compliance)
        </h3>
        <p className="text-sm text-muted-foreground">
          Prevent dangerous permission combinations that could enable fraud, abuse, or compliance violations.
        </p>
      </div>

      {/* Core Principle */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Separation of Duties Principle</h3>

        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg mb-4">
          <p className="text-sm font-bold text-red-700 mb-2">No Single Point of Control</p>
          <p className="text-xs text-red-600">
            Critical operations must involve multiple people. No single user should have both the ability to initiate AND approve the same action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <h4 className="font-bold text-blue-700 text-sm mb-2">Create vs Approve</h4>
            <p className="text-xs text-blue-600">
              Developer creates code, different person approves. Prevents self-approval and deliberate backdoors.
            </p>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <h4 className="font-bold text-purple-700 text-sm mb-2">Modify vs Audit</h4>
            <p className="text-xs text-purple-600">
              Policy maker modifies rules, independent auditor checks compliance. Prevents covering up changes.
            </p>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <h4 className="font-bold text-green-700 text-sm mb-2">Initiate vs Execute</h4>
            <p className="text-xs text-green-600">
              Requester initiates changes, different user executes them. Prevents unauthorized changes.
            </p>
          </div>

          <div className="p4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <h4 className="font-bold text-orange-700 text-sm mb-2">Grant vs Revoke</h4>
            <p className="text-xs text-orange-600">
              Admin grants access, different admin revokes. Prevents creating backdoors or hiding misuse.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Rules */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Separation of Duties Rules</h3>

        <div className="space-y-2">
          {complianceRules.map(rule => {
            const isSelected = selectedRule === rule.id;
            return (
              <button
                key={rule.id}
                onClick={() => setSelectedRule(rule.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-border bg-card/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {rule.name}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getSeverityBadge(rule.severity)}`}>
                        {rule.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {rule.status === 'active' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Rule Details */}
      {currentRule && (
        <div className={`rounded-xl border p-6 bg-card/50 ${getSeverityColor(currentRule.severity)}`}>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-foreground mb-2">{currentRule.name}</h3>
              <p className="text-sm text-muted-foreground">{currentRule.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-foreground text-sm mb-2">Prevented Combination</p>
                <div className="space-y-1">
                  {currentRule.preventedCombination.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span className="font-mono text-foreground">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-foreground text-sm mb-2">Real-World Example</p>
                <p className="text-xs text-muted-foreground bg-black/10 p-3 rounded">
                  {currentRule.example}
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Enforcement Mechanism</p>
              <p className="text-xs text-foreground bg-black/10 p-3 rounded">
                {currentRule.enforcement}
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Status</p>
              <div className="flex items-center gap-2">
                {currentRule.status === 'active' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-foreground">
                      Actively enforced - violations are blocked
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs text-foreground">
                      Monitored only - violations are logged for review
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Violation Detection */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Violation Detection & Prevention
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/30 rounded-lg">
            <p className="font-bold text-red-700 text-sm mb-2">Real-Time Detection</p>
            <p className="text-xs text-red-600">
              System continuously monitors user actions. If user attempts to violate a separation-of-duties rule, action is blocked immediately.
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/30 rounded-lg">
            <p className="font-bold text-orange-700 text-sm mb-2">Violation Blocking</p>
            <p className="text-xs text-orange-600">
              Critical violations are prevented (button disabled, action rejected). User cannot proceed.
            </p>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/30 rounded-lg">
            <p className="font-bold text-yellow-700 text-sm mb-2">Violation Logging</p>
            <p className="text-xs text-yellow-600">
              All violations (attempted and successful) are logged with user, action, timestamp, and reason for review by compliance team.
            </p>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/30 rounded-lg">
            <p className="font-bold text-blue-700 text-sm mb-2">Audit Report</p>
            <p className="text-xs text-blue-600">
              Compliance dashboard shows violation trends, repeat offenders, and risk areas requiring management attention.
            </p>
          </div>
        </div>
      </div>

      {/* Violation Examples */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Violation Scenarios</h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-700 text-sm mb-1">Scenario 1: Self-Approval</p>
                <p className="text-xs text-red-600">
                  Developer Ahmed creates automation "daily_reboot". He attempts to approve his own automation. BLOCKED: System prevents self-approval.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-700 text-sm mb-1">Scenario 2: Hiding Changes</p>
                <p className="text-xs text-red-600">
                  Manager Sarah modifies security policy. She then tries to run audit on policy to hide her changes. BLOCKED: System prevents auditing own changes.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-700 text-sm mb-1">Scenario 3: Access Backdoor</p>
                <p className="text-xs text-red-600">
                  Admin Mohammed grants access to suspicious account. Attempts to revoke investigation before auditor can check. BLOCKED: Different admin needed for revocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Benefits */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Compliance Benefits</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-2">✓ Fraud Prevention</p>
            <p className="text-xs text-green-600">
              Prevents single user from orchestrating fraudulent actions without detection.
            </p>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-2">✓ Audit Readiness</p>
            <p className="text-xs text-green-600">
              Demonstrates compliance with audit standards (SOX, HIPAA, ISO 27001, etc.)
            </p>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-2">✓ Insider Threat Mitigation</p>
            <p className="text-xs text-green-600">
              Reduces insider threat risk by requiring multiple people for sensitive operations.
            </p>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-bold text-green-700 text-sm mb-2">✓ Regulatory Compliance</p>
            <p className="text-xs text-green-600">
              Meets regulatory requirements for multi-person controls and authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
