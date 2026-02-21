import React, { useState } from 'react';
import { X, Copy, Download, AlertCircle } from 'lucide-react';
import { Alarm, getSeverityIcon, getSeverityColor, getSeverityTextColor } from '../utils/alarmData';
import { CommentsPanel } from './CommentsPanel';
import { VendorFieldsDisplay } from './ExpertModeToggle';
import { AlarmSLATimer } from './AlarmSLATimer';
import { formatDateTime } from '../utils/timeModeManager';

interface AlarmDetailsSidePanelProps {
  alarm: Alarm | null;
  onClose: () => void;
  onAddComment?: (alarmId: string, text: string, severity?: 'info' | 'warning' | 'critical') => void;
  expertMode: boolean;
}

export const AlarmDetailsSidePanel: React.FC<AlarmDetailsSidePanelProps> = ({
  alarm,
  onClose,
  onAddComment,
  expertMode
}) => {
  const [copied, setCopied] = useState(false);

  if (!alarm) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcknowledge = () => {
    // In a real app, this would call an API
    console.log('Alarm acknowledged:', alarm.globalAlarmId);
  };

  const handleEscalate = () => {
    // In a real app, this would call an API
    console.log('Alarm escalated:', alarm.globalAlarmId);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l border-gray-200 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Alarm Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Severity banner */}
        <div className={`p-4 rounded-lg border-2 ${getSeverityColor(alarm.severity)} ${getSeverityTextColor(alarm.severity)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getSeverityIcon(alarm.severity)}</span>
            <div>
              <h3 className="font-bold text-lg">{alarm.severity.toUpperCase()}</h3>
              <p className="text-sm opacity-90">{alarm.title}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAcknowledge}
            disabled={alarm.acknowledged}
            className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
              alarm.acknowledged
                ? 'bg-green-100 text-green-800 border border-green-300 cursor-not-allowed'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
            }`}
          >
            {alarm.acknowledged ? '✓ Acknowledged' : 'Acknowledge'}
          </button>
          <button
            onClick={handleEscalate}
            className="px-3 py-2 rounded-lg font-semibold text-sm bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300 transition"
          >
            Escalate
          </button>
        </div>

        {/* Alarm IDs */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Identification</h4>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-gray-50 rounded border border-gray-200 flex items-start gap-2">
              <span className="font-mono flex-1 break-all text-gray-800">{alarm.globalAlarmId}</span>
              <button
                onClick={() => copyToClipboard(alarm.globalAlarmId)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                title="Copy Global Alarm ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Global Alarm ID</p>
            </div>

            {expertMode && (
              <>
                <div className="p-2 bg-purple-50 rounded border border-purple-200 flex items-start gap-2">
                  <span className="font-mono flex-1 break-all text-purple-800">{alarm.vendorAlarmId}</span>
                  <button
                    onClick={() => copyToClipboard(alarm.vendorAlarmId)}
                    className="text-purple-400 hover:text-purple-600 flex-shrink-0 mt-0.5"
                    title="Copy Vendor Alarm ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Vendor Alarm ID</p>
                </div>

                <div className="p-2 bg-purple-50 rounded border border-purple-200 flex items-start gap-2">
                  <span className="font-mono flex-1 break-all text-purple-800">{alarm.vendorAlarmCode}</span>
                  <button
                    onClick={() => copyToClipboard(alarm.vendorAlarmCode || '')}
                    className="text-purple-400 hover:text-purple-600 flex-shrink-0 mt-0.5"
                    title="Copy Vendor Alarm Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-gray-600">Vendor Alarm Code</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Description</h4>
          <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded border border-gray-200 leading-relaxed">
            {alarm.description}
          </p>
        </div>

        {/* Classification */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Classification</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-gray-600 mb-1">Type</p>
              <p className="font-semibold text-blue-900">{alarm.alarmType}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded border border-purple-200">
              <p className="text-gray-600 mb-1">Category</p>
              <p className="font-semibold text-purple-900">{alarm.category}</p>
            </div>
          </div>
        </div>

        {/* Technologies */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {alarm.technologies.map(tech => (
              <span
                key={tech}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Object Context */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Object Context</h4>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-600 text-xs mb-1">Object</p>
              <p className="font-semibold text-gray-900">{alarm.objectName}</p>
              <p className="text-xs text-gray-600 mt-1">
                {alarm.objectType.charAt(0).toUpperCase() + alarm.objectType.slice(1)}
              </p>
            </div>

            {/* Hierarchy path */}
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-gray-600 text-xs font-semibold mb-2">Hierarchy</p>
              <div className="space-y-1 text-xs text-blue-900">
                {alarm.hierarchy.region && <p>• Region: <span className="font-semibold">{alarm.hierarchy.region}</span></p>}
                {alarm.hierarchy.cluster && <p>• Cluster: <span className="font-semibold">{alarm.hierarchy.cluster}</span></p>}
                {alarm.hierarchy.site && <p>• Site: <span className="font-semibold">{alarm.hierarchy.site}</span></p>}
                {alarm.hierarchy.node && <p>• Node: <span className="font-semibold">{alarm.hierarchy.node}</span></p>}
                {alarm.hierarchy.cell && <p>• Cell: <span className="font-semibold">{alarm.hierarchy.cell}</span></p>}
                {alarm.hierarchy.interface && <p>• Interface: <span className="font-semibold">{alarm.hierarchy.interface}</span></p>}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Metadata */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Operational</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {alarm.assignedTeam && (
              <div className="p-2 bg-green-50 rounded border border-green-200">
                <p className="text-gray-600 mb-1">Assigned Team</p>
                <p className="font-semibold text-green-900">{alarm.assignedTeam}</p>
              </div>
            )}
            {alarm.escalationLevel && (
              <div className={`p-2 rounded border ${
                alarm.escalationLevel === 'L4' ? 'bg-red-50 border-red-200' :
                alarm.escalationLevel === 'L3' ? 'bg-orange-50 border-orange-200' :
                alarm.escalationLevel === 'L2' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-gray-600 mb-1">Escalation</p>
                <p className="font-semibold">{alarm.escalationLevel}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Timeline</h4>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-600 mb-1">Created</p>
              <p className="font-mono text-gray-800">{formatDateTime(new Date(alarm.createdAt))}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-600 mb-1">Last Updated</p>
              <p className="font-mono text-gray-800">{formatDateTime(new Date(alarm.updatedAt))}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-600 mb-1">Duration</p>
              <p className="font-semibold text-gray-800">{alarm.duration}</p>
            </div>
          </div>
        </div>

        {/* SLA Timer */}
        <AlarmSLATimer alarm={alarm} />

        {/* Acknowledgment status */}
        {alarm.acknowledged && alarm.acknowledgedAt && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-800">
                <p className="font-semibold mb-1">Acknowledged</p>
                <p>{alarm.acknowledgedBy || 'Unknown user'}</p>
                <p className="text-green-700">{formatDateTime(new Date(alarm.acknowledgedAt))}</p>
              </div>
            </div>
          </div>
        )}

        {/* Expert mode: Vendor data */}
        {expertMode && alarm.rawVendorData && (
          <div className="space-y-2">
            <VendorFieldsDisplay
              vendorData={alarm.rawVendorData}
              sourceSystem={alarm.sourceSystem}
            />
          </div>
        )}

        {/* Comments */}
        {onAddComment && (
          <div className="mt-4">
            <CommentsPanel
              alarmId={alarm.globalAlarmId}
              comments={alarm.comments}
              onAddComment={onAddComment}
            />
          </div>
        )}

        {/* Export button */}
        <button className="w-full px-4 py-2 rounded-lg font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 transition flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Export Details
        </button>
      </div>
    </div>
  );
};
