import { Eye, Download, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export default function SimulationPreview() {
  const previewReport = {
    title: 'Daily Transport KPI Summary',
    generatedAt: new Date().toLocaleString(),
    status: 'valid',
    blocks: [
      {
        type: 'metrics',
        data: [
          { label: 'Network Availability', value: '99.8%', status: 'healthy' },
          { label: 'Avg Latency', value: '12.4ms', status: 'healthy' },
          { label: 'Congestion Events', value: '3', status: 'warning' },
          { label: 'SLA Compliance', value: '98.5%', status: 'healthy' }
        ]
      },
      {
        type: 'chart',
        title: 'Hourly Traffic Pattern',
        data: 'Line chart with 24-hour utilization trend'
      },
      {
        type: 'table',
        title: 'Top Issues',
        data: [
          { site: 'Cairo-Site-1', issue: 'Congestion', severity: 'High', count: 2 },
          { site: 'Cairo-Site-2', issue: 'Latency', severity: 'Medium', count: 1 }
        ]
      },
      {
        type: 'narrative',
        content: 'Network performed well with 99.8% availability. Three minor congestion events occurred during peak hours but were resolved through automated load balancing. All SLA targets met.'
      }
    ],
    validationStatus: [
      { check: 'Data source connectivity', status: 'pass' },
      { check: 'Dataset freshness', status: 'pass' },
      { check: 'Schema validation', status: 'pass' },
      { check: 'Missing value check', status: 'pass' },
      { check: 'Threshold checks', status: 'pass' }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Preview Header */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Report Output Simulation
        </h3>
        <p className="text-sm text-muted-foreground">
          Preview the exact output that will be delivered to recipients. Nothing damages credibility faster than broken executive reports.
        </p>
      </div>

      {/* Preview Status */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${previewReport.status === 'valid' ? 'bg-green-600' : 'bg-red-600'}`} />
            <div>
              <h4 className="font-bold text-foreground">{previewReport.title}</h4>
              <p className="text-xs text-muted-foreground">Generated: {previewReport.generatedAt}</p>
            </div>
          </div>
          <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
            previewReport.status === 'valid'
              ? 'bg-green-500/10 text-green-700'
              : 'bg-red-500/10 text-red-700'
          }`}>
            {previewReport.status === 'valid' ? '✓ Ready to Send' : '✗ Validation Issues'}
          </span>
        </div>
      </div>

      {/* Pre-Delivery Validation */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Pre-Delivery Validation Checks</h3>

        <div className="space-y-2">
          {previewReport.validationStatus.map((check, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <span className="text-sm text-foreground">{check.check}</span>
              {check.status === 'pass' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      <div className="rounded-xl border border-border/50 p-8 bg-card/50 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 space-y-6 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{previewReport.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Report for {new Date().toLocaleDateString()}</p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            {previewReport.blocks[0].data.map((metric, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                <p className={`text-2xl font-bold ${
                  metric.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{previewReport.blocks[1].title}</p>
            <div className="h-48 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">[Chart visualization renders here]</p>
            </div>
          </div>

          {/* Narrative */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">{previewReport.blocks[3].content}</p>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-600 dark:text-gray-400">
            <p>Confidential - Internal Use Only</p>
            <p>Data sources: Transport KPI Dataset, Topology Module, Alarms Module</p>
          </div>
        </div>
      </div>

      {/* Preview Actions */}
      <div className="flex gap-3 justify-center">
        <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download PDF Preview
        </button>
        <button className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium flex items-center gap-2">
          <Eye className="w-4 h-4" />
          View Full Report
        </button>
        <button className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Refresh Preview
        </button>
      </div>

      {/* Quality Assurance Notes */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Quality Assurance Checklist
        </h3>

        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Data Integrity</p>
                <p className="text-xs text-muted-foreground">All metrics validated against source datasets</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Visual Rendering</p>
                <p className="text-xs text-muted-foreground">Charts, colors, and layouts display correctly</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Narrative Clarity</p>
                <p className="text-xs text-muted-foreground">AI-generated text is accurate and professional</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-start gap-2">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Executive Ready</p>
                <p className="text-xs text-muted-foreground">Branding, formatting, and messaging approved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="rounded-xl border border-border/50 p-6 bg-green-500/5 border-green-500/20">
        <h3 className="font-bold text-foreground mb-3">Confidence Score: 99.4%</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This report is safe to deliver. All data sources are fresh, all validations passed, and output formatting is executive-ready.
        </p>
        <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium">
          ✓ Approve & Schedule
        </button>
      </div>
    </div>
  );
}
