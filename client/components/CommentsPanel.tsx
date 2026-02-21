import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { AlarmComment } from '../utils/alarmData';
import { formatDateTime } from '../utils/timeModeManager';

interface CommentsPanelProps {
  alarmId: string;
  comments: AlarmComment[];
  onAddComment: (alarmId: string, text: string, severity?: 'info' | 'warning' | 'critical') => void;
  readOnly?: boolean;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  alarmId,
  comments,
  onAddComment,
  readOnly = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(alarmId, newComment, selectedSeverity);
      setNewComment('');
      setSelectedSeverity('info');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddComment();
    }
  };

  const getSeverityColor = (severity?: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityBadgeColor = (severity?: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-200 text-yellow-700';
      case 'info':
      default:
        return 'bg-blue-200 text-blue-700';
    }
  };

  const getSeverityIcon = (severity?: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
      default:
        return '🔵';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Comments</h3>
          {comments.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {comments.length}
            </span>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isCollapsed ? '▸' : '▾'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
              </div>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(comment.severity)}`}
                >
                  {/* Comment header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSeverityIcon(comment.severity)}</span>
                      <div>
                        <p className="text-sm font-semibold">
                          {comment.author}
                        </p>
                        <p className="text-xs opacity-75">
                          {formatDateTime(new Date(comment.timestamp))}
                        </p>
                      </div>
                    </div>
                    {comment.severity && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getSeverityBadgeColor(comment.severity)}`}>
                        {comment.severity.charAt(0).toUpperCase() + comment.severity.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Comment text */}
                  <p className="text-sm leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add comment section */}
          {!readOnly && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Comment Severity
                </label>
                <div className="flex gap-2">
                  {['info', 'warning', 'critical'].map(severity => (
                    <button
                      key={severity}
                      onClick={() => setSelectedSeverity(severity as 'info' | 'warning' | 'critical')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                        selectedSeverity === severity
                          ? getSeverityBadgeColor(severity as 'info' | 'warning' | 'critical')
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {getSeverityIcon(severity as 'info' | 'warning' | 'critical')} {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a comment... (Ctrl+Enter to submit)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                />
              </div>

              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  newComment.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Post Comment
              </button>
            </div>
          )}

          {readOnly && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Read-only mode
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Small comment indicator for table cells
export const CommentIndicator: React.FC<{ count: number; hasWarning?: boolean; hasCritical?: boolean }> = ({
  count,
  hasWarning = false,
  hasCritical = false
}) => {
  if (count === 0) return null;

  const color = hasCritical ? 'text-red-600' : hasWarning ? 'text-yellow-600' : 'text-blue-600';

  return (
    <div className={`flex items-center gap-1 text-sm font-semibold ${color}`}>
      <MessageSquare className="w-4 h-4" />
      <span>{count}</span>
    </div>
  );
};
