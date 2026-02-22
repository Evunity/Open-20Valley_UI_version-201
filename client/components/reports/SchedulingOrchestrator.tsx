import { Clock, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface Schedule {
  id: string;
  reportName: string;
  scheduleType: 'time-based' | 'trigger-based' | 'on-demand';
  frequency?: string;
  trigger?: string;
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused' | 'failed';
}

export default function SchedulingOrchestrator() {
  const schedules: Schedule[] = [
    {
      id: '1',
      reportName: 'Daily Transport KPI',
      scheduleType: 'time-based',
      frequency: 'Every day at 6:00 AM',
      nextRun: '2024-03-12 06:00 AM',
      lastRun: '2024-03-11 06:02 AM',
      status: 'active'
    },
    {
      id: '2',
      reportName: 'Monthly Revenue Report',
      scheduleType: 'time-based',
      frequency: 'First day of month at 8:00 AM',
      nextRun: '2024-04-01 08:00 AM',
      lastRun: '2024-03-01 08:15 AM',
      status: 'active'
    },
    {
      id: '3',
      reportName: 'Alarm Spike Analysis',
      scheduleType: 'trigger-based',
      trigger: 'WHEN alarm_count > 50 in 5min window',
      nextRun: 'On next trigger',
      lastRun: '2024-03-11 14:32 PM',
      status: 'active'
    },
    {
      id: '4',
      reportName: 'Automation ROI Report',
      scheduleType: 'trigger-based',
      trigger: 'WHEN automation_execution COMPLETES',
      nextRun: 'On next execution',
      lastRun: '2024-03-11 11:45 AM',
      status: 'active'
    }
  ];

  const getStatusColor = (status: Schedule['status']) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-500/10';
      case 'paused': return 'text-yellow-700 bg-yellow-500/10';
      case 'failed': return 'text-red-700 bg-red-500/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Scheduled Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Execution Schedules
          </h3>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            + Create Schedule
          </button>
        </div>

        <div className="space-y-3">
          {schedules.map(schedule => (
            <div
              key={schedule.id}
              className="rounded-xl border border-border/50 p-4 bg-card/50 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-foreground">{schedule.reportName}</h4>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Type:</strong> {schedule.scheduleType === 'time-based' ? 'Time-Based' : 'Trigger-Based'}
                    </p>
                    {schedule.frequency ? (
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Frequency:</strong> {schedule.frequency}
                      </p>
                    ) : (
                      <p className="text-muted-foreground font-mono text-xs bg-muted/50 px-2 py-1 rounded w-fit">
                        {schedule.trigger}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Next Run</p>
                  <p className="font-medium text-foreground">{schedule.nextRun}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Run</p>
                  <p className="font-medium text-foreground">{schedule.lastRun}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium">
                  Edit
                </button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                  Run Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger-Based Configuration */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Trigger Configuration
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Create intelligent triggers that automatically generate reports when specific conditions are met:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Example: Congestion Alert</p>
            <code className="block text-xs text-muted-foreground font-mono whitespace-pre-wrap">
{`TRIGGER congestion_alert
  WHEN transport_utilization > 80% 
  FOR DURATION 10 minutes
  THEN generate_report('Congestion Analysis')
  AND distribute_to(['Operations', 'Engineering'])`}
            </code>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Example: Automation Success Report</p>
            <code className="block text-xs text-muted-foreground font-mono whitespace-pre-wrap">
{`TRIGGER automation_completion
  WHEN automation_execution.status == 'SUCCESS'
  AND affected_alarms_reduced > 100
  THEN generate_report('Automation ROI')
  WITH params(
    execution_id, 
    alarms_before, 
    alarms_after,
    cost_saved
  )`}
            </code>
          </div>
        </div>
      </div>

      {/* Time-Based Scheduling */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Time-Based Scheduling
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Report</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>Transport Network KPI</option>
              <option>Revenue Report</option>
              <option>Executive Dashboard</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Frequency</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Custom</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Time</label>
              <input type="time" defaultValue="06:00" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Time Zone</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>UTC+2 (Cairo)</option>
              <option>UTC+3 (East Africa)</option>
              <option>UTC+0 (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Distribution on Completion */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Auto-Distribute on Completion</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Automatically send reports to recipients when execution completes:
        </p>

        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Recipients for Daily Transport KPI</p>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>Transport Team (email, dashboard)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>Operations Manager (email)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span>Executive Dashboard (auto-refresh)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Execution History */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Recent Execution History</h3>

        <div className="space-y-2">
          {[
            { time: '2024-03-11 06:02 AM', report: 'Daily Transport KPI', status: 'success', duration: '45s' },
            { time: '2024-03-11 14:32 PM', report: 'Alarm Spike Analysis', status: 'success', duration: '12s' },
            { time: '2024-03-10 06:00 AM', report: 'Daily Transport KPI', status: 'success', duration: '48s' },
            { time: '2024-03-09 06:01 AM', report: 'Daily Transport KPI', status: 'failed', duration: '2s' },
          ].map((execution, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{execution.report}</p>
                <p className="text-xs text-muted-foreground">{execution.time}</p>
              </div>
              <div className="flex items-center gap-2">
                {execution.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs text-muted-foreground">{execution.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
