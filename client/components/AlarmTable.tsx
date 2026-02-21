import React, { useState } from 'react';
import { ChevronDown, MessageSquare, Pin } from 'lucide-react';
import { Alarm, getSeverityIcon, getSeverityColor, getSeverityTextColor, getSeverityBadgeClass } from '../utils/alarmData';
import { formatDateTime } from '../utils/timeModeManager';

interface AlarmTableProps {
  alarms: Alarm[];
  expertMode: boolean;
  onAlarmSelect: (alarm: Alarm) => void;
  onObjectClick: (objectName: string, objectType: string) => void;
  selectedAlarmIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

interface SortConfig {
  key: keyof Alarm | 'duration' | 'escalation';
  direction: 'asc' | 'desc';
}

export const AlarmTable: React.FC<AlarmTableProps> = ({
  alarms,
  expertMode,
  onAlarmSelect,
  onObjectClick,
  selectedAlarmIds = new Set(),
  onSelectionChange
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
  const [expandedAlarmId, setExpandedAlarmId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['severity', 'title', 'object', 'sourceSystem', 'duration', 'assignedTeam', 'escalation', 'comments'])
  );

  const handleSelectAlarm = (alarmId: string) => {
    const newSelection = new Set(selectedAlarmIds);
    if (newSelection.has(alarmId)) {
      newSelection.delete(alarmId);
    } else {
      newSelection.add(alarmId);
    }
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedAlarmIds.size === sortedAlarms.length) {
      onSelectionChange?.(new Set());
    } else {
      const allIds = new Set(sortedAlarms.map(a => a.globalAlarmId));
      onSelectionChange?.(allIds);
    }
  };

  // Sort alarms
  const sortedAlarms = React.useMemo(() => {
    const sorted = [...alarms].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Alarm];
      let bValue: any = b[sortConfig.key as keyof Alarm];

      // Handle special cases
      if (sortConfig.key === 'duration') {
        aValue = a.duration;
        bValue = b.duration;
      } else if (sortConfig.key === 'escalation') {
        aValue = a.escalationLevel || '';
        bValue = b.escalationLevel || '';
      }

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    return sorted;
  }, [alarms, sortConfig]);

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumnVisibility = (column: string) => {
    const newColumns = new Set(visibleColumns);
    if (newColumns.has(column)) {
      newColumns.delete(column);
    } else {
      newColumns.add(column);
    }
    setVisibleColumns(newColumns);
  };

  const SortIndicator = ({ column }: { column: SortConfig['key'] }) => {
    if (sortConfig.key !== column) return null;
    return <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const ColumnHeader = ({ label, column }: { label: string; column: SortConfig['key'] }) => (
    <th
      onClick={() => handleSort(column)}
      className="px-2 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
    >
      {label}
      <SortIndicator column={column} />
    </th>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Column visibility toggle */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Cols:</span>
        {['severity', 'title', 'object', 'sourceSystem', 'duration', 'assignedTeam', 'escalation', 'comments'].map(col => (
          <button
            key={col}
            onClick={() => toggleColumnVisibility(col)}
            className={`px-2 py-1 text-xs rounded border transition ${
              visibleColumns.has(col)
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 text-left bg-gray-50 border-b border-gray-200 w-10">
                <input
                  type="checkbox"
                  checked={selectedAlarmIds.size === sortedAlarms.length && sortedAlarms.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
              </th>
              {visibleColumns.has('severity') && <ColumnHeader label="Severity" column="severity" />}
              {visibleColumns.has('title') && <ColumnHeader label="Title" column="title" />}
              {visibleColumns.has('object') && <ColumnHeader label="Object" column="objectName" />}
              {visibleColumns.has('sourceSystem') && <ColumnHeader label="Source" column="sourceSystem" />}
              {visibleColumns.has('duration') && <ColumnHeader label="Duration" column="duration" />}
              {visibleColumns.has('assignedTeam') && <ColumnHeader label="Team" column="assignedTeam" />}
              {visibleColumns.has('escalation') && <ColumnHeader label="Escalation" column="escalation" />}
              {visibleColumns.has('comments') && <ColumnHeader label="Comments" column="title" />}
              {expertMode && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">Vendor Code</th>}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {sortedAlarms.map(alarm => (
              <React.Fragment key={alarm.globalAlarmId}>
                <tr
                  className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                    selectedAlarmIds.has(alarm.globalAlarmId) ? 'bg-blue-100' :
                    alarm.severity === 'critical' ? 'bg-red-50' :
                    alarm.severity === 'major' ? 'bg-orange-50' :
                    alarm.acknowledged ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedAlarmIds.has(alarm.globalAlarmId)}
                      onChange={() => handleSelectAlarm(alarm.globalAlarmId)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </td>
                  {/* Severity */}
                  {visibleColumns.has('severity') && (
                    <td className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onAlarmSelect(alarm)}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSeverityIcon(alarm.severity)}</span>
                        <span className={`font-semibold ${getSeverityTextColor(alarm.severity)}`}>
                          {alarm.severity.charAt(0).toUpperCase() + alarm.severity.slice(1)}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Title */}
                  {visibleColumns.has('title') && (
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                      {alarm.title}
                    </td>
                  )}

                  {/* Object with hierarchy */}
                  {visibleColumns.has('object') && (
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onObjectClick(alarm.objectName, alarm.objectType);
                          }}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {alarm.objectName}
                        </button>
                        <span className="text-xs text-gray-500">
                          {alarm.objectType.charAt(0).toUpperCase() + alarm.objectType.slice(1)}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Source System */}
                  {visibleColumns.has('sourceSystem') && (
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        {alarm.sourceSystem}
                      </span>
                    </td>
                  )}

                  {/* Duration */}
                  {visibleColumns.has('duration') && (
                    <td className="px-4 py-3 text-gray-600">
                      {alarm.duration}
                    </td>
                  )}

                  {/* Assigned Team */}
                  {visibleColumns.has('assignedTeam') && (
                    <td className="px-4 py-3">
                      {alarm.assignedTeam ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {alarm.assignedTeam}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </td>
                  )}

                  {/* Escalation Level */}
                  {visibleColumns.has('escalation') && (
                    <td className="px-4 py-3">
                      {alarm.escalationLevel && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          alarm.escalationLevel === 'L4' ? 'bg-red-100 text-red-800' :
                          alarm.escalationLevel === 'L3' ? 'bg-orange-100 text-orange-800' :
                          alarm.escalationLevel === 'L2' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alarm.escalationLevel}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Comments indicator */}
                  {visibleColumns.has('comments') && (
                    <td className="px-4 py-3">
                      {alarm.comments.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-600">
                            {alarm.comments.length}
                          </span>
                        </div>
                      )}
                    </td>
                  )}

                  {/* Expert mode: Vendor code */}
                  {expertMode && (
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {alarm.vendorAlarmCode}
                    </td>
                  )}

                  {/* Expand button */}
                  <td className="px-2 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedAlarmId(expandedAlarmId === alarm.globalAlarmId ? null : alarm.globalAlarmId);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedAlarmId === alarm.globalAlarmId ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </td>
                </tr>

                {/* Expanded row with details */}
                {expandedAlarmId === alarm.globalAlarmId && (
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td colSpan={expertMode ? 10 : 9} className="px-6 py-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 mb-1">Description</h4>
                            <p className="text-sm text-gray-800">{alarm.description}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 mb-1">Category</h4>
                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {alarm.category}
                            </span>
                          </div>
                        </div>

                        {/* Technologies */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-2">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {alarm.technologies.map(tech => (
                              <span key={tech} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Hierarchy */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 mb-2">Hierarchy</h4>
                          <div className="text-sm text-gray-700">
                            {alarm.hierarchy.region && <span>{alarm.hierarchy.region}</span>}
                            {alarm.hierarchy.cluster && <span> &gt; {alarm.hierarchy.cluster}</span>}
                            {alarm.hierarchy.site && <span> &gt; {alarm.hierarchy.site}</span>}
                            {alarm.hierarchy.node && <span> &gt; {alarm.hierarchy.node}</span>}
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-semibold">Created:</span> {formatDateTime(new Date(alarm.createdAt))}
                          </div>
                          <div>
                            <span className="font-semibold">Updated:</span> {formatDateTime(new Date(alarm.updatedAt))}
                          </div>
                        </div>

                        {/* Acknowledgment status */}
                        {alarm.acknowledged && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                            <Pin className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-800">
                              Acknowledged by {alarm.acknowledgedBy} on {alarm.acknowledgedAt ? formatDateTime(new Date(alarm.acknowledgedAt)) : 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row count */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {sortedAlarms.length} alarm{sortedAlarms.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
