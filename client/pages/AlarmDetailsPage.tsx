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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${getSeverityColor(alarm.severity)} border-b-4 ${getSeverityColor(alarm.severity)}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
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
              <p className="text-sm text-gray-600 mt-1">{alarm.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT: Alarm DNA */}
          <div className="col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Alarm DNA</h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Probable Cause */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" /> Probable Cause
                  </h3>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                    {`${alarm.sourceSystem} interface showing degraded performance due to high CPU utilization. Possible root: insufficient bandwidth capacity or misconfiguration.`}
                  </p>
                </div>

                {/* Root Cause */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" /> Root Cause
                  </h3>
                  <p className="text-sm text-gray-700 bg-red-50 p-3 rounded border border-red-200">
                    {`Device ${alarm.objectName} experiencing sustained high traffic. Parent alarm may be network congestion at ${alarm.hierarchy.site || 'N/A'}.`}
                  </p>
                </div>

                {/* Vendor Description */}
                <div className="col-span-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Vendor Description</h3>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                    {`[${alarm.sourceSystem}] Alarm Code: ${alarm.vendorAlarmCode || 'N/A'} - ${alarm.alarmType}. Type: ${alarm.category}. Contact vendor support if issue persists.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Occurrence Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Occurrence Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                  <span className="text-sm font-semibold text-green-900">First Occurrence</span>
                  <span className="text-sm text-gray-700">{formatDateTime(new Date(alarm.createdAt))}</span>
                </div>

                {/* Occurrences Chart */}
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Occurrences per Hour</p>
                  <div className="flex items-end gap-1 h-12">
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
                  <p className="text-xs text-gray-600 mt-2">
                    Total Occurrences: <span className="font-bold">{occurrenceChart.reduce((sum, item) => sum + item.occurrences, 0)}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <span className="text-sm font-semibold text-blue-900">Last Occurrence</span>
                  <span className="text-sm text-gray-700">{formatDateTime(new Date(alarm.updatedAt))}</span>
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <AlarmSLATimer alarm={alarm} />
            </div>

            {/* Impact Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" /> Impact
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Affected Sites:</span>
                  <span className="font-bold text-gray-900">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Affected Cells:</span>
                  <span className="font-bold text-gray-900">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Users:</span>
                  <span className="font-bold text-gray-900">~15K</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <span className="text-gray-600">Technologies:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alarm.technologies.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-600" /> Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-gray-700">ID:</span>
                  <p className="text-gray-600 font-mono mt-1 break-all">{alarm.globalAlarmId}</p>
                </div>
                <div className="border-t pt-2">
                  <span className="font-semibold text-gray-700">Type:</span>
                  <p className="text-gray-600 mt-1">{alarm.alarmType}</p>
                </div>
                <div className="border-t pt-2">
                  <span className="font-semibold text-gray-700">Category:</span>
                  <p className="text-gray-600 mt-1">{alarm.category}</p>
                </div>
                <div className="border-t pt-2">
                  <span className="font-semibold text-gray-700">Vendor:</span>
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
