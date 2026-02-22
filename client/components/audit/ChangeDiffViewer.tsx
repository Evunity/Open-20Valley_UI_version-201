import { ArrowRight, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface ParameterChange {
  name: string;
  beforeValue: string | number | boolean;
  afterValue: string | number | boolean;
  type: 'modified' | 'added' | 'removed';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

export default function ChangeDiffViewer() {
  const [expandedDiff, setExpandedDiff] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const changes: ParameterChange[] = [
    {
      name: 'Tilt Angle',
      beforeValue: '6°',
      afterValue: '10°',
      type: 'modified',
      severity: 'high',
      timestamp: '2024-03-11 14:32:15'
    },
    {
      name: 'Azimuth Position',
      beforeValue: '45°',
      afterValue: '48°',
      type: 'modified',
      severity: 'medium',
      timestamp: '2024-03-11 14:32:18'
    },
    {
      name: 'Power Level',
      beforeValue: '32 dBm',
      afterValue: '35 dBm',
      type: 'modified',
      severity: 'high',
      timestamp: '2024-03-11 14:32:22'
    },
    {
      name: 'Frequency Band',
      beforeValue: 'Band 7 (2.6 GHz)',
      afterValue: 'Band 7 + Band 20 (2.6 + 0.8 GHz)',
      type: 'modified',
      severity: 'critical',
      timestamp: '2024-03-11 14:32:25'
    },
    {
      name: 'Antenna Configuration',
      beforeValue: '2x2 MIMO',
      afterValue: '4x4 MIMO',
      type: 'modified',
      severity: 'high',
      timestamp: '2024-03-11 14:32:28'
    },
    {
      name: 'Beam Switching Mode',
      beforeValue: 'Disabled',
      afterValue: 'Enabled',
      type: 'added',
      severity: 'critical',
      timestamp: '2024-03-11 14:32:31'
    },
    {
      name: 'Load Balancing Weight',
      beforeValue: '100',
      afterValue: '150',
      type: 'modified',
      severity: 'medium',
      timestamp: '2024-03-11 14:32:34'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-700';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'modified':
        return 'Modified';
      case 'added':
        return 'Added';
      case 'removed':
        return 'Removed';
      default:
        return '';
    }
  };

  const handleCopy = (text: string, paramName: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(paramName);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleExport = () => {
    const diffText = changes
      .map(
        (change) =>
          `${change.name}\n` +
          `  Before: ${change.beforeValue}\n` +
          `  After: ${change.afterValue}\n` +
          `  Type: ${getTypeLabel(change.type)}\n` +
          `  Severity: ${change.severity}\n` +
          `  Time: ${change.timestamp}\n`
      )
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(diffText));
    element.setAttribute('download', `parameter-changes-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-blue-600" />
          Change Diff Viewer
        </h3>
        <p className="text-sm text-muted-foreground">
          Side-by-side parameter comparison with visual highlighting. Track configuration changes with impact assessment for forensic investigations.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border/50 p-4 bg-card/50">
          <p className="text-xs text-muted-foreground mb-1">Total Changes</p>
          <p className="text-2xl font-bold text-foreground">{changes.length}</p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-xs text-red-700 mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-700">
            {changes.filter((c) => c.severity === 'critical').length}
          </p>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
          <p className="text-xs text-orange-700 mb-1">High Priority</p>
          <p className="text-2xl font-bold text-orange-700">
            {changes.filter((c) => c.severity === 'high').length}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 p-4 bg-card/50">
          <p className="text-xs text-muted-foreground mb-1">Time Window</p>
          <p className="text-sm font-mono text-foreground">19 seconds</p>
        </div>
      </div>

      {/* Changes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Parameter Changes</h3>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Diff
          </button>
        </div>

        {changes.map((change, index) => (
          <div key={index} className={`rounded-lg border p-4 cursor-pointer transition-colors ${getSeverityColor(change.severity)}`}>
            <div className="flex items-start justify-between gap-4" onClick={() => setExpandedDiff(expandedDiff === `${index}` ? null : `${index}`)}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-foreground">{change.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityBadgeColor(change.severity)}`}>
                    {change.severity.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/20">
                    {getTypeLabel(change.type)}
                  </span>
                </div>

                {/* Side-by-side comparison */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1">
                    <p className="text-xs font-medium opacity-70 mb-1">Before</p>
                    <p className="font-mono text-foreground bg-black/10 px-3 py-2 rounded">{change.beforeValue}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 flex-shrink-0" />

                  <div className="flex-1">
                    <p className="text-xs font-medium opacity-70 mb-1">After</p>
                    <p className="font-mono text-foreground bg-black/10 px-3 py-2 rounded">{change.afterValue}</p>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedDiff === `${index}` && (
                  <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Change Type</p>
                        <p className="font-medium text-foreground">{getTypeLabel(change.type)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timestamp</p>
                        <p className="font-mono text-foreground">{change.timestamp}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(String(change.beforeValue), 'before');
                        }}
                        className="flex-1 px-3 py-1.5 rounded border border-black/20 hover:bg-black/10 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copyFeedback === 'before' ? 'Copied!' : 'Copy Before'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(String(change.afterValue), 'after');
                        }}
                        className="flex-1 px-3 py-1.5 rounded border border-black/20 hover:bg-black/10 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copyFeedback === 'after' ? 'Copied!' : 'Copy After'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {change.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Impact Summary */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-3">Impact Assessment</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Frequency Band Addition:</span> Addition of Band 20 increases capacity but may cause interference patterns
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Beam Switching Activation:</span> MIMO enhancement improves throughput but changes load distribution
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Power Level Increase:</span> 3 dBm boost (~99% power increase) may impact adjacent cells
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
