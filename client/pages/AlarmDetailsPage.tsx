import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Lightbulb, Clock, TrendingDown, Database } from 'lucide-react';
import { Alarm, getSeverityIcon, getSeverityColor, getSeverityTextColor } from '../utils/alarmData';
import { formatDateTime } from '../utils/timeModeManager';
import { AlarmSLATimer } from '../components/AlarmSLATimer';
import { CommentsPanel } from '../components/CommentsPanel';

interface AlarmDetailsPageProps {
  alarm: Alarm;
}

export const AlarmDetailsPage: React.FC<AlarmDetailsPageProps> = ({ alarm }) => {
  const navigate = useNavigate();
  const [occurrenceChart, setOccurrenceChart] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock occurrence timeline
    const chart = [];
    const baseDate = new Date(alarm.createdAt);
    for (let i = 0; i < 10; i++) {
      const date = new Date(baseDate.getTime() + i * 60 * 60000);
      chart.push({
        time: date.toLocaleTimeString().slice(0, 5),
        occurrences: Math.floor(Math.random() * 50 + 10)
      });
    }
    setOccurrenceChart(chart);
  }, [alarm]);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Header */}
      <div className={`${getSeverityColor(alarm.severity)} border-b-4 ${getSeverityColor(alarm.severity)}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-foreground dark:text-foreground hover:opacity-80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Alarms
          </button>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{getSeverityIcon(alarm.severity)}</span>
            <div>
              <h1 className={`text-2xl font-bold ${getSeverityTextColor(alarm.severity)}`}>
                {alarm.title}
              </h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">{alarm.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Alarm DNA */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground dark:text-foreground mb-4">Alarm DNA</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Probable Cause */}
                <div>
                  <h3 className="text-sm font-bold text-foreground dark:text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-500" /> Probable Cause
                  </h3>
                  <p className="text-sm text-foreground dark:text-muted-foreground bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded border border-yellow-200 dark:border-yellow-900">
                    {`${alarm.sourceSystem} interface showing degraded performance due to high CPU utilization. Possible root: insufficient bandwidth capacity or misconfiguration.`}
                  </p>
                </div>

                {/* Root Cause */}
                <div>
                  <h3 className="text-sm font-bold text-foreground dark:text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500" /> Root Cause
                  </h3>
                  <p className="text-sm text-foreground dark:text-muted-foreground bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200 dark:border-red-900">
                    {`Device ${alarm.objectName} experiencing sustained high traffic. Parent alarm may be network congestion at ${alarm.hierarchy.site || 'N/A'}.`}
                  </p>
                </div>

                {/* Vendor Description */}
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-sm font-bold text-foreground dark:text-foreground mb-2">Vendor Description</h3>
                  <p className="text-sm text-foreground dark:text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200 dark:border-blue-900">
                    {`[${alarm.sourceSystem}] Alarm Code: ${alarm.vendorAlarmCode || 'N/A'} - ${alarm.alarmType}. Type: ${alarm.category}. Contact vendor support if issue persists.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Occurrence Timeline */}
            <div className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground dark:text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Occurrence Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-900">
                  <span className="text-sm font-semibold text-green-900 dark:text-green-300">First Occurrence</span>
                  <span className="text-sm text-foreground dark:text-muted-foreground">{formatDateTime(new Date(alarm.createdAt))}</span>
                </div>

                {/* Occurrences Chart */}
                <div className="p-3 bg-muted dark:bg-muted rounded border border-border dark:border-border">
                  <p className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground mb-2">Occurrences per Hour</p>
                  <div className="flex items-end gap-1 h-12 sm:h-14 md:h-16">
                    {occurrenceChart.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                          style={{ height: `${(item.occurrences / 60) * 100}%`, minHeight: '4px' }}
                          title={`${item.time}: ${item.occurrences} occurrences`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
                    Total Occurrences: <span className="font-bold">{occurrenceChart.reduce((sum, item) => sum + item.occurrences, 0)}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Last Occurrence</span>
                  <span className="text-sm text-foreground dark:text-muted-foreground">{formatDateTime(new Date(alarm.updatedAt))}</span>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <CommentsPanel
                alarmId={alarm.globalAlarmId}
                comments={alarm.comments}
                onAddComment={() => {}} // In real app, would update backend
              />
            </div>
          </div>

          {/* RIGHT: SLA, Impact, KPIs */}
          <div className="space-y-6">
            {/* SLA Timer */}
            <div className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-6 shadow-sm">
              <AlarmSLATimer alarm={alarm} />
            </div>

            {/* Impact Summary */}
            <div className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-500" /> Impact
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-muted-foreground">Affected Sites:</span>
                  <span className="font-bold text-foreground dark:text-foreground">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-muted-foreground">Affected Cells:</span>
                  <span className="font-bold text-foreground dark:text-foreground">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-muted-foreground">Estimated Users:</span>
                  <span className="font-bold text-foreground dark:text-foreground">~15K</span>
                </div>
                <div className="border-t border-border dark:border-border pt-2 mt-2">
                  <span className="text-muted-foreground dark:text-muted-foreground">Technologies:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alarm.technologies.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Information */}
            <div className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground dark:text-foreground mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-foreground dark:text-foreground" /> Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-foreground dark:text-foreground">ID:</span>
                  <p className="text-muted-foreground dark:text-muted-foreground font-mono mt-1 break-all">{alarm.globalAlarmId}</p>
                </div>
                <div className="border-t border-border dark:border-border pt-2">
                  <span className="font-semibold text-foreground dark:text-foreground">Type:</span>
                  <p className="text-muted-foreground dark:text-muted-foreground mt-1">{alarm.alarmType}</p>
                </div>
                <div className="border-t border-border dark:border-border pt-2">
                  <span className="font-semibold text-foreground dark:text-foreground">Category:</span>
                  <p className="text-muted-foreground dark:text-muted-foreground mt-1">{alarm.category}</p>
                </div>
                <div className="border-t border-border dark:border-border pt-2">
                  <span className="font-semibold text-foreground dark:text-foreground">Vendor:</span>
                  <p className="text-gray-600 mt-1">{alarm.sourceSystem}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
