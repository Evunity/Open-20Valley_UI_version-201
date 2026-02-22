import { Filter, Check, X, Edit, Plus } from 'lucide-react';
import { useState } from 'react';

interface NormalizationRule {
  category: string;
  description: string;
  ruleCount: number;
  eventCount: number;
  examples: string[];
  icon: string;
}

export default function ActivityNormalizationRules() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('authentication');
  const [showNewRule, setShowNewRule] = useState(false);
  const [selectedRuleCategory, setSelectedRuleCategory] = useState<string | null>(null);

  const normalizationRules: NormalizationRule[] = [
    {
      category: 'Authentication',
      description: 'Login, logout, MFA, password changes, session events',
      ruleCount: 12,
      eventCount: 8943,
      examples: [
        'user_login - Maps to: User session started',
        'failed_auth - Maps to: Authentication failure detected',
        'mfa_verified - Maps to: Multi-factor authentication succeeded',
        'session_timeout - Maps to: User session expired'
      ],
      icon: '🔐'
    },
    {
      category: 'Authorization',
      description: 'Permission grants, role changes, access control modifications',
      ruleCount: 18,
      eventCount: 2847,
      examples: [
        'role_assigned - Maps to: User role modified',
        'permission_grant - Maps to: Resource permission granted',
        'access_denied - Maps to: Access control enforcement',
        'group_membership - Maps to: Group membership modified'
      ],
      icon: '🔑'
    },
    {
      category: 'Automation',
      description: 'Workflow execution, policy application, automated decisions',
      ruleCount: 24,
      eventCount: 15264,
      examples: [
        'automation_trigger - Maps to: Automation rule executed',
        'policy_applied - Maps to: Configuration policy applied',
        'workflow_start - Maps to: Automated workflow initiated',
        'rule_execution - Maps to: Automation engine decision'
      ],
      icon: '⚙️'
    },
    {
      category: 'AI Decisions',
      description: 'Machine learning predictions, model inference, anomaly detection',
      ruleCount: 8,
      eventCount: 5432,
      examples: [
        'ml_prediction - Maps to: AI model inference executed',
        'anomaly_detected - Maps to: Behavioral anomaly flagged',
        'risk_score_updated - Maps to: Risk assessment recalculated',
        'model_decision - Maps to: Machine learning model decision'
      ],
      icon: '🧠'
    },
    {
      category: 'Configuration',
      description: 'Settings changes, parameter modifications, system configuration',
      ruleCount: 31,
      eventCount: 12847,
      examples: [
        'config_modified - Maps to: Configuration parameter changed',
        'setting_updated - Maps to: System setting modified',
        'parameter_change - Maps to: Operating parameter adjusted',
        'frequency_band_update - Maps to: Network frequency configuration changed'
      ],
      icon: '⚙️'
    },
    {
      category: 'Commands',
      description: 'API calls, CLI commands, direct system instructions',
      ruleCount: 15,
      eventCount: 3921,
      examples: [
        'api_call - Maps to: API endpoint invoked',
        'cli_command - Maps to: Command-line instruction executed',
        'direct_action - Maps to: Direct system command executed',
        'operator_command - Maps to: Operator console command issued'
      ],
      icon: '💻'
    },
    {
      category: 'Reports',
      description: 'Report generation, data exports, analytics queries',
      ruleCount: 9,
      eventCount: 4156,
      examples: [
        'report_generated - Maps to: Report generated and delivered',
        'data_export - Maps to: Data extraction initiated',
        'query_executed - Maps to: Analytics query processed',
        'export_completed - Maps to: Data export completed'
      ],
      icon: '📊'
    },
    {
      category: 'Exports',
      description: 'Data downloads, file extractions, bulk exports',
      ruleCount: 10,
      eventCount: 2103,
      examples: [
        'bulk_export - Maps to: Bulk data export initiated',
        'file_download - Maps to: File downloaded to external storage',
        'data_extraction - Maps to: Sensitive data extracted',
        'archive_created - Maps to: Data archive created for export'
      ],
      icon: '📤'
    },
    {
      category: 'API Calls',
      description: 'REST API, GraphQL, webhook invocations, third-party integrations',
      ruleCount: 22,
      eventCount: 18546,
      examples: [
        'rest_api_call - Maps to: REST API endpoint invoked',
        'graphql_query - Maps to: GraphQL query executed',
        'webhook_triggered - Maps to: Webhook callback invoked',
        'integration_call - Maps to: Third-party integration API called'
      ],
      icon: '🔗'
    },
    {
      category: 'Alarm Actions',
      description: 'Alarm acknowledgment, suppression, escalation, resolution',
      ruleCount: 14,
      eventCount: 7832,
      examples: [
        'alarm_acknowledged - Maps to: Alert acknowledged by operator',
        'alarm_suppressed - Maps to: Alert suppression activated',
        'alarm_escalated - Maps to: Alert escalated to senior team',
        'alarm_resolved - Maps to: Alert marked as resolved'
      ],
      icon: '🚨'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600" />
          Activity Normalization Rules
        </h3>
        <p className="text-sm text-muted-foreground">
          Events MUST be categorized into standard taxonomies. Normalization ensures consistent audit trails across all system components for forensic accuracy and compliance.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border/50 p-4 bg-card/50">
          <p className="text-xs text-muted-foreground mb-1">Total Categories</p>
          <p className="text-2xl font-bold text-foreground">{normalizationRules.length}</p>
        </div>
        <div className="rounded-lg border border-border/50 p-4 bg-card/50">
          <p className="text-xs text-muted-foreground mb-1">Total Rules</p>
          <p className="text-2xl font-bold text-foreground">
            {normalizationRules.reduce((sum, rule) => sum + rule.ruleCount, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 p-4 bg-card/50">
          <p className="text-xs text-muted-foreground mb-1">Events Normalized</p>
          <p className="text-2xl font-bold text-foreground">
            {normalizationRules.reduce((sum, rule) => sum + rule.eventCount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Event Categories & Rules
          </h3>
          <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>

        <div className="space-y-2">
          {normalizationRules.map((rule) => (
            <div
              key={rule.category}
              className="rounded-lg border border-border/50 p-4 bg-card/50 hover:border-border transition-colors"
            >
              {/* Header */}
              <div
                onClick={() => setExpandedCategory(expandedCategory === rule.category.toLowerCase() ? null : rule.category.toLowerCase())}
                className="cursor-pointer flex items-center justify-between gap-4 mb-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{rule.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{rule.category}</p>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Rules</p>
                    <p className="font-bold text-foreground">{rule.ruleCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Events</p>
                    <p className="font-bold text-foreground">{rule.eventCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expandedCategory === rule.category.toLowerCase() && (
                <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Normalization Rules
                  </h4>

                  <div className="space-y-2">
                    {rule.examples.map((example, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30 text-xs">
                        <p className="font-mono text-foreground">{example}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rule Management */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedRuleCategory(rule.category)}
                      className="flex-1 px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit Rules
                    </button>
                    <button className="flex-1 px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-xs font-medium flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" />
                      Add Rule
                    </button>
                    <button className="flex-1 px-3 py-1.5 rounded bg-green-600/10 text-green-700 hover:bg-green-600/20 transition-colors text-xs font-medium flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" />
                      Validate All
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Normalization Pipeline */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Normalization Pipeline</h3>

        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Event Ingestion</p>
                <p className="text-sm text-muted-foreground">
                  Raw events from all sources (APIs, webhooks, logs) enter normalization pipeline
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Pattern Matching</p>
                <p className="text-sm text-muted-foreground">
                  Rule engine matches event signatures against normalization patterns
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Categorization</p>
                <p className="text-sm text-muted-foreground">
                  Events classified into standard taxonomy (Authentication, Authorization, etc.)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Enrichment</p>
                <p className="text-sm text-muted-foreground">
                  Context added (risk score, correlation ID, related events)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                5
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Immutable Storage</p>
                <p className="text-sm text-muted-foreground">
                  Normalized event recorded in append-only audit log with cryptographic signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Notes */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Compliance & Standards</h3>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">NIST Audit Log Requirements:</span> All events categorized and timestamped with nanosecond precision
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Immutability Guarantee:</span> Normalized records cryptographically signed and tamper-evident
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Cross-System Consistency:</span> Uniform event schema across all 847 monitored network components
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Audit Explainability:</span> Each normalized event includes decision rationale for traceability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
