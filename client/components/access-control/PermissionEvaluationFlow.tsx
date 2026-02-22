import { CheckCircle, XCircle, AlertCircle, ArrowRight, Lock, Shield, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface EvaluationExample {
  user: string;
  action: string;
  tenant: string;
  step1: boolean;
  step2: boolean;
  step3: boolean;
  result: 'allowed' | 'denied';
  reason: string;
}

export default function PermissionEvaluationFlow() {
  const [selectedExample, setSelectedExample] = useState<string>('example-1');

  const examples: EvaluationExample[] = [
    {
      user: 'Ahmed Hassan',
      action: 'Execute automation in Egypt Operator',
      tenant: 'Egypt Operator',
      step1: true,
      step2: true,
      step3: true,
      result: 'allowed',
      reason: 'All checks passed. User is operator in Egypt tenant with required permissions.'
    },
    {
      user: 'Sarah Williams',
      action: 'Modify automation in Saudi Operator',
      tenant: 'Saudi Operator',
      step1: true,
      step2: false,
      step3: false,
      result: 'denied',
      reason: 'User lacks automation edit permission in their role.'
    },
    {
      user: 'External Contractor',
      action: 'View reports in Egypt Operator',
      tenant: 'Egypt Operator',
      step1: false,
      step2: false,
      step3: false,
      result: 'denied',
      reason: 'User is not assigned to this tenant. Complete access denial.'
    },
    {
      user: 'Operations Manager',
      action: 'Execute bulk command',
      tenant: 'Egypt Operator',
      step1: true,
      step2: true,
      step3: false,
      result: 'denied',
      reason: 'Policy condition failed: Bulk operations require MFA during non-business hours.'
    }
  ];

  const currentExample = examples.find(e => e.user === selectedExample);

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-cyan-600" />
          Permission Evaluation Flow
        </h3>
        <p className="text-sm text-muted-foreground">
          Every action goes through a 3-step permission check. Failure at any step results in denial and logging.
        </p>
      </div>

      {/* Core Principle */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">3-Step Permission Evaluation</h3>

        <div className="space-y-4">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-700 text-sm mb-1">Tenant Access Check</h4>
                <p className="text-xs text-blue-600">
                  Is the user assigned to this tenant? Users cannot access tenants they don't belong to.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-muted-foreground">
            <ArrowRight className="w-6 h-6 rotate-90" />
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-purple-700 text-sm mb-1">Role Permission Check</h4>
                <p className="text-xs text-purple-600">
                  Does the user's role have this permission? Checks module, page, and operation access.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-muted-foreground">
            <ArrowRight className="w-6 h-6 rotate-90" />
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-700 text-sm mb-1">Policy Condition Check</h4>
                <p className="text-xs text-green-600">
                  Are all policy conditions met? Time-based, risk-based, scope-based, and conditional policies.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-700 font-bold">
            ⚠️ If ANY step fails → Access is DENIED and the action is logged
          </p>
        </div>
      </div>

      {/* Example Selection */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Permission Evaluation Examples</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {examples.map(example => (
            <button
              key={example.user}
              onClick={() => setSelectedExample(example.user)}
              className={`p-4 rounded-lg border transition-colors text-left ${
                selectedExample === example.user
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 hover:border-border bg-card/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold ${selectedExample === example.user ? 'text-primary' : 'text-foreground'}`}>
                  {example.user}
                </h4>
                {example.result === 'allowed' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{example.action}</p>
            </button>
          ))}
        </div>

        {/* Current Example Detailed Flow */}
        {currentExample && (
          <div className="p-6 bg-muted/30 rounded-lg border border-border/30 space-y-4">
            <div>
              <h4 className="font-bold text-foreground mb-3">Step-by-Step Evaluation</h4>

              {/* Step 1 */}
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-2">
                  {currentExample.step1 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      Step 1: Tenant Access Check
                    </p>
                    <p className={`text-xs mt-1 ${currentExample.step1 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentExample.step1
                        ? `✓ ${currentExample.user} is assigned to ${currentExample.tenant}`
                        : `✗ ${currentExample.user} is NOT assigned to ${currentExample.tenant}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-2">
                  {currentExample.step2 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      Step 2: Role Permission Check
                    </p>
                    <p className={`text-xs mt-1 ${currentExample.step2 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentExample.step2
                        ? '✓ User role has required module, page, and operation permissions'
                        : '✗ User role lacks required permission for this operation'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-2">
                  {currentExample.step3 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      Step 3: Policy Condition Check
                    </p>
                    <p className={`text-xs mt-1 ${currentExample.step3 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentExample.step3
                        ? '✓ All policy conditions satisfied (time-based, risk-based, scope-based)'
                        : '✗ Policy conditions not met for this operation'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className={`mt-6 p-4 rounded-lg border ${
                currentExample.result === 'allowed'
                  ? 'bg-green-500/5 border-green-500/30'
                  : 'bg-red-500/5 border-red-500/30'
              }`}>
                <p className={`font-bold text-sm ${currentExample.result === 'allowed' ? 'text-green-700' : 'text-red-700'}`}>
                  {currentExample.result === 'allowed' ? '✓ ACCESS ALLOWED' : '✗ ACCESS DENIED'}
                </p>
                <p className={`text-xs mt-1 ${currentExample.result === 'allowed' ? 'text-green-600' : 'text-red-600'}`}>
                  {currentExample.reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Identity Model */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Identity Model</h3>

        <div className="space-y-3">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="font-semibold text-blue-700 text-sm mb-2">Multi-Tenant Identity</p>
            <p className="text-xs text-blue-600">
              Each user can belong to one or more tenants with different roles in each tenant.
            </p>
          </div>

          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <p className="font-semibold text-purple-700 text-sm mb-2">Zero-Permission Default</p>
            <p className="text-xs text-purple-600">
              Identity alone gives NO power. Users have zero permissions without explicit role assignment.
            </p>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <p className="font-semibold text-orange-700 text-sm mb-2">Role-Based Access</p>
            <p className="text-xs text-orange-600">
              All permissions are granted through roles. Each role explicitly defines what can be accessed and modified.
            </p>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="font-semibold text-green-700 text-sm mb-2">Per-Tenant Roles</p>
            <p className="text-xs text-green-600">
              Same user can have different roles in different tenants. Example: Admin in Egypt, Operator in Saudi Arabia.
            </p>
          </div>
        </div>
      </div>

      {/* Enforcement Rules */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Critical Enforcement Rule
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/30 rounded-lg">
            <p className="font-bold text-red-700 text-sm mb-2">Never Evaluate Permissions Only in Frontend</p>
            <p className="text-xs text-red-600 mb-3">
              Permissions must be enforced at multiple levels:
            </p>
            <ul className="space-y-1 text-xs text-red-600">
              <li>✓ <span className="font-semibold">API Gateway:</span> Validate before routing to service</li>
              <li>✓ <span className="font-semibold">Backend Service:</span> Validate business logic access</li>
              <li>✓ <span className="font-semibold">Database Layer:</span> Validate data access filters</li>
              <li>✓ <span className="font-semibold">Frontend (UI only):</span> Hide/disable inaccessible features</li>
              <li>✗ <span className="font-semibold">Never:</span> Trust frontend permission checks alone</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="font-semibold text-blue-700 text-sm mb-2">UI Enforcement Rules</p>
            <div className="space-y-1 text-xs text-blue-600">
              <div>• No module access → Hide entire module from sidebar</div>
              <div>• No page access → Block page navigation</div>
              <div>• No operation access → Disable button (gray it out)</div>
              <div>• No field access → Make field read-only</div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logging */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Audit Logging of Denials</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Every denied action must be logged for security review and compliance:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-03-11 14:32:15 | User: ahmed.hassan | Tenant: Egypt</p>
            <p className="text-muted-foreground">Action: Execute Automation | Result: DENIED</p>
            <p className="text-muted-foreground">Reason: Step 2 failed - User role lacks automation execute permission</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-03-11 14:31:45 | User: external_user | Tenant: Saudi</p>
            <p className="text-muted-foreground">Action: View Reports | Result: DENIED</p>
            <p className="text-muted-foreground">Reason: Step 1 failed - User not assigned to Saudi Operator tenant</p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono">
            <p className="text-foreground">2024-03-11 14:31:20 | User: operations_mgr | Tenant: Egypt</p>
            <p className="text-muted-foreground">Action: Bulk Command Execute | Result: DENIED</p>
            <p className="text-muted-foreground">Reason: Step 3 failed - Policy condition: Bulk ops require MFA after 18:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
