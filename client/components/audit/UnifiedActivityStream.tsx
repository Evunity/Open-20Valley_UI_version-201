import { useState } from 'react';
import { Search, Filter, Download, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditEvent {
  eventId: string;
  timestamp: string;
  actor: string;
  actorType: 'user' | 'system' | 'ai' | 'automation' | 'api' | 'service';
  action: string;
  target: string;
  result: 'success' | 'failure' | 'blocked';
  severity: 'info' | 'warning' | 'critical';
  correlationId: string;
  details: string;
}

export default function UnifiedActivityStream() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');

  const events: AuditEvent[] = [
    {
      eventId: 'EVT-20240311-001',
      timestamp: '2024-03-11 14:32:15.847',
      actor: 'rf_engineer',
      actorType: 'user',
      action: 'PRIVILEGE_ESCALATION',
      target: 'System Admin Role',
      result: 'success',
      severity: 'critical',
      correlationId: 'CORR-2024-003847',
      details: 'User escalated from RF Engineer to Admin role. Used MFA verification. Reason: Emergency configuration push.'
    },
    {
      eventId: 'EVT-20240311-002',
      timestamp: '2024-03-11 14:30:42.123',
      actor: 'automation_engine',
      actorType: 'automation',
      action: 'CONFIGURATION_CHANGE',
      target: 'Transport KPI Parameters',
      result: 'success',
      severity: 'warning',
      correlationId: 'CORR-2024-003846',
      details: 'Automation executed load balancing policy affecting 3 parameters on Cairo-Site-1.'
    },
    {
      eventId: 'EVT-20240311-003',
      timestamp: '2024-03-11 14:28:56.512',
      actor: 'ops_manager',
      actorType: 'user',
      action: 'REPORT_EXPORT',
      target: 'Daily Transport KPI Report (PDF)',
      result: 'success',
      severity: 'info',
      correlationId: 'CORR-2024-003845',
      details: 'Exported report to external email address (compliant with data governance).'
    },
    {
      eventId: 'EVT-20240311-004',
      timestamp: '2024-03-11 14:25:31.789',
      actor: 'external_api',
      actorType: 'api',
      action: 'DATA_QUERY',
      target: 'Alarm Summary Dataset',
      result: 'blocked',
      severity: 'warning',
      correlationId: 'CORR-2024-003844',
      details: 'API request from unauthorized IP address blocked (rate limit exceeded: 500 req/min).'
    },
    {
      eventId: 'EVT-20240311-005',
      timestamp: '2024-03-11 14:22:14.345',
      actor: 'system',
      actorType: 'system',
      action: 'BACKUP_COMPLETED',
      target: 'Audit Log Archive',
      result: 'success',
      severity: 'info',
      correlationId: 'CORR-2024-003843',
      details: 'Daily audit log backup completed. 1.2GB archived to cold storage.'
    },
    {
      eventId: 'EVT-20240311-006',
      timestamp: '2024-03-11 14:18:47.654',
      actor: 'ai_decision_engine',
      actorType: 'ai',
      action: 'POLICY_RECOMMENDATION',
      target: 'Load Balancing Policy',
      result: 'success',
      severity: 'info',
      correlationId: 'CORR-2024-003842',
      details: 'AI recommended parameter adjustment to optimize congestion (confidence: 94%).'
    }
  ];

  const getActorBadgeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500/20 text-blue-700';
      case 'system': return 'bg-gray-500/20 text-gray-700';
      case 'ai': return 'bg-purple-500/20 text-purple-700';
      case 'automation': return 'bg-green-500/20 text-green-700';
      case 'api': return 'bg-yellow-500/20 text-yellow-700';
      case 'service': return 'bg-cyan-500/20 text-cyan-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2">Unified Activity Stream</h3>
        <p className="text-sm text-muted-foreground">
          Complete immutable log of all platform events. Every action is timestamped to nanosecond precision, correlated, and forensically complete.
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by actor, action, target, or event ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events • Time Precision: Millisecond
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-3">
        {filteredEvents.map(event => (
          <div
            key={event.eventId}
            className="rounded-xl border border-border/50 p-4 bg-card/50 hover:border-primary/30 transition-all group"
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {getSeverityIcon(event.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-mono text-muted-foreground">{event.eventId}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded font-semibold", getActorBadgeColor(event.actorType))}>
                      {event.actorType.toUpperCase()}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-semibold",
                      event.severity === 'critical' ? 'bg-red-500/20 text-red-700' :
                      event.severity === 'warning' ? 'bg-orange-500/20 text-orange-700' :
                      'bg-green-500/20 text-green-700'
                    )}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-foreground mb-1">
                    <span className="font-mono">{event.actor}</span> performed <span className="font-mono text-primary">{event.action}</span>
                  </p>

                  <p className="text-xs text-muted-foreground mb-2">
                    Target: <span className="font-mono text-foreground">{event.target}</span> • Result: <span className={event.result === 'success' ? 'text-green-600 font-semibold' : event.result === 'failure' ? 'text-red-600 font-semibold' : 'text-yellow-600 font-semibold'}>{event.result.toUpperCase()}</span>
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {event.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(event, null, 2))}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Copy event details"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Timestamp: <span className="font-mono text-foreground">{event.timestamp}</span></span>
                <span>Correlation: <span className="font-mono text-foreground">{event.correlationId}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Immutability Note */}
      <div className="rounded-xl border border-border/50 p-4 bg-card/50">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          All events are cryptographically signed and immutable. Audit trail cannot be modified, deleted, or backdated without detection.
        </p>
      </div>
    </div>
  );
}
