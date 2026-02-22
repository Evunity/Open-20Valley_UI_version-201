import { AlertCircle, CheckCircle, FileText, Lock, Shield } from 'lucide-react';

interface ComplianceRequirement {
  regulation: string;
  requirement: string;
  status: 'compliant' | 'warning' | 'breach';
  lastAudit: string;
  nextAudit: string;
  evidenceCount: number;
}

export default function RegulatoryIntelligenceHub() {
  const complianceRequirements: ComplianceRequirement[] = [
    {
      regulation: 'Egypt Telecom Authority (ETA)',
      requirement: 'Network quality report submission (monthly)',
      status: 'compliant',
      lastAudit: '2024-03-01',
      nextAudit: '2024-04-01',
      evidenceCount: 12
    },
    {
      regulation: 'Data Protection Law (Egypt)',
      requirement: 'Customer data handling audit trail',
      status: 'compliant',
      lastAudit: '2024-02-15',
      nextAudit: '2024-05-15',
      evidenceCount: 28
    },
    {
      regulation: 'International Roaming Standards',
      requirement: 'Roaming performance metrics reporting',
      status: 'warning',
      lastAudit: '2024-02-28',
      nextAudit: '2024-03-28',
      evidenceCount: 8
    },
    {
      regulation: 'GDPR (EU Partners)',
      requirement: 'Data residency verification',
      status: 'compliant',
      lastAudit: '2024-03-05',
      nextAudit: '2024-06-05',
      evidenceCount: 15
    }
  ];

  const auditTrail = [
    { timestamp: '2024-03-11 14:32', action: 'Transport KPI Report Generated', user: 'system', status: 'success' },
    { timestamp: '2024-03-11 11:45', action: 'Automation Execution Completed', user: 'automation', status: 'success' },
    { timestamp: '2024-03-11 09:15', action: 'Parameter Change Applied', user: 'rf_engineer', status: 'success' },
    { timestamp: '2024-03-11 08:00', action: 'Report Distributed', user: 'system', status: 'success' },
    { timestamp: '2024-03-10 23:45', action: 'Dataset Refresh Failed', user: 'system', status: 'failure' },
  ];

  const getStatusColor = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'compliant':
        return 'text-green-700 bg-green-500/10';
      case 'warning':
        return 'text-yellow-700 bg-yellow-500/10';
      case 'breach':
        return 'text-red-700 bg-red-500/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Total Regulations</p>
          <p className="text-3xl font-bold text-foreground">4</p>
          <p className="text-xs text-muted-foreground mt-2">Active compliance frameworks</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Compliant</p>
          <p className="text-3xl font-bold text-green-600">3</p>
          <p className="text-xs text-muted-foreground mt-2">75% of requirements</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Warnings</p>
          <p className="text-3xl font-bold text-yellow-600">1</p>
          <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Audit Evidence</p>
          <p className="text-3xl font-bold text-foreground">63</p>
          <p className="text-xs text-muted-foreground mt-2">Records tracked</p>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Regulatory Compliance Status
        </h3>

        <div className="space-y-3">
          {complianceRequirements.map((req, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                req.status === 'compliant'
                  ? 'bg-green-500/5 border-green-500/20'
                  : req.status === 'warning'
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{req.regulation}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{req.requirement}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getStatusColor(req.status)}`}>
                  {req.status === 'compliant' && '✓ Compliant'}
                  {req.status === 'warning' && '⚠ Warning'}
                  {req.status === 'breach' && '✗ Breach'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Audit</p>
                  <p className="font-medium text-foreground">{req.lastAudit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Next Audit</p>
                  <p className="font-medium text-foreground">{req.nextAudit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Evidence Records</p>
                  <p className="font-medium text-foreground">{req.evidenceCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Immutable Audit Trail
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Complete record of all reporting operations for compliance verification and forensic analysis:
        </p>

        <div className="space-y-2">
          {auditTrail.map((entry, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-muted-foreground text-xs">{entry.timestamp}</p>
                <p className="font-medium text-foreground text-sm mt-1">{entry.action}</p>
                <p className="text-xs text-muted-foreground mt-0.5">User: {entry.user}</p>
              </div>
              {entry.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 ml-2" />
              )}
            </div>
          ))}
        </div>

        <button className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
          View Full Audit Log (1,245 records)
        </button>
      </div>

      {/* Data Governance */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          Data Governance & Access Control
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-3">Role-Based Access Control</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Executive (5 users)</span>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-700 rounded text-xs font-semibold">View Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Managers (12 users)</span>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-700 rounded text-xs font-semibold">View & Download</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">BI Team (3 users)</span>
                <span className="px-2 py-1 bg-green-500/10 text-green-700 rounded text-xs font-semibold">Full Access</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">System Accounts (4)</span>
                <span className="px-2 py-1 bg-purple-500/10 text-purple-700 rounded text-xs font-semibold">API Access</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-3">Data Retention Policy</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Audit logs: Retained indefinitely (immutable)</li>
              <li>• Operational reports: 2-year retention minimum</li>
              <li>• Regulatory reports: 7-year retention (legal requirement)</li>
              <li>• Personal data: 90-day purge after subject removal</li>
            </ul>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-3">Encryption & Security</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• TLS 1.3 for data in transit</li>
              <li>• AES-256 for data at rest</li>
              <li>• End-to-end encryption for sensitive reports</li>
              <li>• HSM-backed key management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance Calendar */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Upcoming Compliance Deadlines</h3>

        <div className="space-y-2">
          {[
            { date: '2024-03-28', requirement: 'International Roaming Performance Report', priority: 'high' },
            { date: '2024-04-01', requirement: 'Monthly Network Quality Report (ETA)', priority: 'critical' },
            { date: '2024-05-15', requirement: 'Data Protection Audit', priority: 'medium' },
            { date: '2024-06-05', requirement: 'GDPR Data Residency Verification', priority: 'medium' }
          ].map((deadline, idx) => (
            <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${
              deadline.priority === 'critical'
                ? 'bg-red-500/5 border-red-500/20'
                : deadline.priority === 'high'
                  ? 'bg-orange-500/5 border-orange-500/20'
                  : 'bg-blue-500/5 border-blue-500/20'
            }`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{deadline.requirement}</p>
                <p className="text-xs text-muted-foreground">{deadline.date}</p>
              </div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                deadline.priority === 'critical' ? 'bg-red-500/20 text-red-700' :
                deadline.priority === 'high' ? 'bg-orange-500/20 text-orange-700' :
                'bg-blue-500/20 text-blue-700'
              }`}>
                {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Recommendations */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Compliance Recommendations</h3>

        <div className="space-y-3">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">✓ Strong Audit Trail</p>
            <p className="text-sm text-muted-foreground">Immutable audit logs provide comprehensive forensic evidence for all regulatory reviews.</p>
          </div>

          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">⚠️ International Roaming Report Due</p>
            <p className="text-sm text-muted-foreground">Schedule roaming performance metrics collection. Configure automated delivery to regulatory team.</p>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-1">ℹ️ Expand GDPR Compliance Evidence</p>
            <p className="text-sm text-muted-foreground">Document data residency verification process for EU partner audits. Automate evidence collection.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
