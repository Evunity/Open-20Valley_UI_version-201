import React, { useState } from 'react';
import { Check, Copy, MessageSquare, Users, Download, X } from 'lucide-react';
import { Alarm } from '../utils/alarmData';

interface BulkOperationsProps {
  selectedAlarms: Alarm[];
  onAcknowledge: (alarmIds: string[]) => void;
  onAssign: (alarmIds: string[], team: string) => void;
  onAddComment: (alarmIds: string[], comment: string) => void;
  onExport: (alarmIds: string[]) => void;
  onCancel: () => void;
}

const TEAMS = ['NOC Team A', 'NOC Team B', 'Field Support', 'Engineering'];

export const AlarmBulkOperations: React.FC<BulkOperationsProps> = ({
  selectedAlarms,
  onAcknowledge,
  onAssign,
  onAddComment,
  onExport,
  onCancel
}) => {
  const [activeOp, setActiveOp] = useState<'acknowledge' | 'assign' | 'comment' | 'export' | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(TEAMS[0]);
  const [comment, setComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAcknowledge = () => {
    setShowConfirm(true);
    setActiveOp('acknowledge');
  };

  const confirmAcknowledge = () => {
    onAcknowledge(selectedAlarms.map(a => a.globalAlarmId));
    setShowConfirm(false);
    setActiveOp(null);
  };

  const handleAssign = (team: string) => {
    setSelectedTeam(team);
    setShowConfirm(true);
    setActiveOp('assign');
  };

  const confirmAssign = () => {
    onAssign(selectedAlarms.map(a => a.globalAlarmId), selectedTeam);
    setShowConfirm(false);
    setActiveOp(null);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onAddComment(selectedAlarms.map(a => a.globalAlarmId), comment);
      setComment('');
      setActiveOp(null);
    }
  };

  const handleExport = () => {
    onExport(selectedAlarms.map(a => a.globalAlarmId));
    setActiveOp(null);
  };

  if (selectedAlarms.length === 0) return null;

  return (
    <div className="bg-blue-50 border-b-2 border-blue-500 p-3 shadow-md">
      {/* Header with count and cancel */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-blue-900">
            {selectedAlarms.length} alarm{selectedAlarms.length !== 1 ? 's' : ''} selected
          </h3>
          <p className="text-xs text-blue-800 mt-0.5">
            Choose an action below
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-blue-600 hover:text-blue-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap mb-3">
        {/* Acknowledge */}
        <button
          onClick={handleAcknowledge}
          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          Acknowledge All
        </button>

        {/* Assign */}
        <div className="relative group">
          <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition flex items-center gap-1">
            <Users className="w-3 h-3" />
            Assign to
          </button>
          <div className="absolute left-0 hidden group-hover:block bg-white border border-gray-200 rounded shadow-lg z-10 mt-1">
            {TEAMS.map(team => (
              <button
                key={team}
                onClick={() => handleAssign(team)}
                className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 first:rounded-t last:rounded-b"
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        {/* Add Comment */}
        <button
          onClick={() => setActiveOp(activeOp === 'comment' ? null : 'comment')}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition flex items-center gap-1 ${
            activeOp === 'comment'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          Add Comment
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="px-3 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded hover:bg-orange-700 transition flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>

      {/* Comment input section */}
      {activeOp === 'comment' && (
        <div className="bg-white rounded border border-purple-200 p-2 mb-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comment to all selected alarms..."
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={2}
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => setActiveOp(null)}
              className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCommentSubmit}
              disabled={!comment.trim()}
              className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Add Comment
            </button>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="bg-white rounded border-2 border-yellow-400 p-3 mb-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {activeOp === 'acknowledge' && `Acknowledge ${selectedAlarms.length} alarms?`}
            {activeOp === 'assign' && `Assign ${selectedAlarms.length} alarms to ${selectedTeam}?`}
          </p>
          <p className="text-xs text-gray-700 mb-3">
            {activeOp === 'acknowledge' && 'This will stop escalation and record the acknowledgment.'}
            {activeOp === 'assign' && 'This will update ownership and start the SLA timer.'}
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowConfirm(false); setActiveOp(null); }}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={activeOp === 'acknowledge' ? confirmAcknowledge : confirmAssign}
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition font-semibold"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
