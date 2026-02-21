import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alarm,
  generateMockAlarms,
  filterAlarms,
  AlarmSeverity,
  TimeMode,
  calculateDuration,
  AlarmComment
} from '../utils/alarmData';
import { initializeTimeMode, getCurrentTimeFormatted, getRefreshInterval, getModeBannerText, isAutoRefreshAllowed } from '../utils/timeModeManager';
import { TimeModeSwitcher } from '../components/TimeModeSwitcher';
import { AlarmFilterPanel, FilterState } from '../components/AlarmFilterPanel';
import { AlarmTable } from '../components/AlarmTable';
import { ObjectHierarchy } from '../components/ObjectHierarchy';
import { ExpertModeToggle } from '../components/ExpertModeToggle';
import { AlarmDetailsSidePanel } from '../components/AlarmDetailsSidePanel';
import { AlarmOverviewWidgets } from '../components/AlarmOverviewWidgets';
import { AlarmStormProtection, detectAlarmStorm, useAlarmStormView } from '../components/AlarmStormProtection';
import { AlarmBulkOperations } from '../components/AlarmBulkOperations';
import { AlarmSideInspectionPanel } from '../components/AlarmSideInspectionPanel';
import { AlarmDetailsPage } from './AlarmDetailsPage';

export const AlarmManagement: React.FC = () => {
  // State management
  const [allAlarms, setAllAlarms] = useState<Alarm[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Time mode state
  const [timeMode, setTimeMode] = useState<TimeMode>('live');
  const [lastRefresh, setLastRefresh] = useState(getCurrentTimeFormatted());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    severity: ['critical', 'major'],
    alarmType: [],
    category: [],
    technologies: [],
    sourceSystem: [],
    searchText: '',
    showAcknowledgedOnly: false,
    showUnacknowledgedOnly: false
  });

  // Object hierarchy drill-down
  const [hierarchyFilters, setHierarchyFilters] = useState<{
    region?: string;
    cluster?: string;
    site?: string;
    node?: string;
  }>({});

  // Refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Alarm storm state
  const { view: stormView, setView: setStormView } = useAlarmStormView();
  const [dismissStormBanner, setDismissStormBanner] = useState(false);
  const isStormActive = detectAlarmStorm(allAlarms.length, 3, 50); // threshold: 50 for demo

  // Bulk operations state
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<Set<string>>(new Set());

  // Side inspection panel state
  const [inspectionAlarm, setInspectionAlarm] = useState<Alarm | null>(null);
  const [viewFullDetails, setViewFullDetails] = useState(false);

  // Initialize alarms on mount
  useEffect(() => {
    const alarms = generateMockAlarms(80);
    setAllAlarms(alarms);
    setIsLoading(false);
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    let filtered = [...allAlarms];

    // Apply severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(alarm => filters.severity.includes(alarm.severity));
    }

    // Apply alarm type filter
    if (filters.alarmType.length > 0) {
      filtered = filtered.filter(alarm => filters.alarmType.includes(alarm.alarmType));
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(alarm => filters.category.includes(alarm.category));
    }

    // Apply technology filter
    if (filters.technologies.length > 0) {
      filtered = filtered.filter(alarm =>
        alarm.technologies.some(tech => filters.technologies.includes(tech))
      );
    }

    // Apply source system filter
    if (filters.sourceSystem.length > 0) {
      filtered = filtered.filter(alarm => filters.sourceSystem.includes(alarm.sourceSystem));
    }

    // Apply search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(alarm =>
        alarm.title.toLowerCase().includes(searchLower) ||
        alarm.description.toLowerCase().includes(searchLower) ||
        alarm.objectName.toLowerCase().includes(searchLower) ||
        alarm.globalAlarmId.toLowerCase().includes(searchLower)
      );
    }

    // Apply acknowledgment filters
    if (filters.showAcknowledgedOnly) {
      filtered = filtered.filter(alarm => alarm.acknowledged);
    }
    if (filters.showUnacknowledgedOnly) {
      filtered = filtered.filter(alarm => !alarm.acknowledged);
    }

    // Apply hierarchy filters
    if (hierarchyFilters.region) {
      filtered = filtered.filter(alarm => alarm.hierarchy.region === hierarchyFilters.region);
    }
    if (hierarchyFilters.cluster) {
      filtered = filtered.filter(alarm => alarm.hierarchy.cluster === hierarchyFilters.cluster);
    }
    if (hierarchyFilters.site) {
      filtered = filtered.filter(alarm => alarm.hierarchy.site === hierarchyFilters.site);
    }
    if (hierarchyFilters.node) {
      filtered = filtered.filter(alarm => alarm.hierarchy.node === hierarchyFilters.node);
    }

    setFilteredAlarms(filtered);
    
    // Deselect alarm if it's filtered out
    if (selectedAlarm && !filtered.find(a => a.globalAlarmId === selectedAlarm.globalAlarmId)) {
      setSelectedAlarm(null);
    }
  }, [allAlarms, filters, hierarchyFilters, selectedAlarm]);

  // Handle mode transition
  const handleModeChange = (mode: TimeMode) => {
    setTimeMode(mode);
    setIsRefreshing(false);
    setIsPaused(false);
    setLastRefresh(getCurrentTimeFormatted());
    
    // Stop current refresh if any
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // Refresh data
  const refreshData = useCallback(() => {
    if (timeMode !== 'live' || isPaused) return;
    
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastRefresh(getCurrentTimeFormatted());
      setIsRefreshing(false);
      
      // Update alarm durations
      setAllAlarms(alarms =>
        alarms.map(alarm => ({
          ...alarm,
          duration: calculateDuration(alarm.createdAt, alarm.updatedAt)
        }))
      );
    }, 500);
  }, [timeMode, isPaused]);

  // Set up auto-refresh for live mode
  useEffect(() => {
    if (timeMode !== 'live') {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Initial refresh
    refreshData();

    // Set up interval
    refreshIntervalRef.current = setInterval(() => {
      refreshData();
    }, 5000); // 5 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [timeMode, isPaused, refreshData]);

  // Handle adding comment
  const handleAddComment = (alarmId: string, text: string, severity?: 'info' | 'warning' | 'critical') => {
    const newComment: AlarmComment = {
      id: `comment-${Date.now()}`,
      author: 'Current User',
      timestamp: new Date().toISOString(),
      text,
      severity
    };

    setAllAlarms(alarms =>
      alarms.map(alarm =>
        alarm.globalAlarmId === alarmId
          ? { ...alarm, comments: [...alarm.comments, newComment] }
          : alarm
      )
    );

    if (selectedAlarm?.globalAlarmId === alarmId) {
      setSelectedAlarm({
        ...selectedAlarm,
        comments: [...selectedAlarm.comments, newComment]
      });
    }
  };

  // Handle object hierarchy filter
  const handleHierarchyFilter = (level: string, value: string) => {
    setHierarchyFilters(prev => ({
      ...prev,
      [level]: prev[level as keyof typeof prev] === value ? undefined : value
    }));
  };

  // Bulk operations handlers
  const handleBulkAcknowledge = (alarmIds: string[]) => {
    setAllAlarms(alarms =>
      alarms.map(alarm =>
        alarmIds.includes(alarm.globalAlarmId)
          ? { ...alarm, acknowledged: true, acknowledgedBy: 'Current User', acknowledgedAt: new Date().toISOString() }
          : alarm
      )
    );
    setSelectedAlarmIds(new Set());
  };

  const handleBulkAssign = (alarmIds: string[], team: string) => {
    setAllAlarms(alarms =>
      alarms.map(alarm =>
        alarmIds.includes(alarm.globalAlarmId)
          ? { ...alarm, assignedTeam: team }
          : alarm
      )
    );
    setSelectedAlarmIds(new Set());
  };

  const handleBulkAddComment = (alarmIds: string[], commentText: string) => {
    const newComment: AlarmComment = {
      id: `comment-${Date.now()}`,
      author: 'Current User',
      timestamp: new Date().toISOString(),
      text: commentText,
      severity: 'info'
    };

    setAllAlarms(alarms =>
      alarms.map(alarm =>
        alarmIds.includes(alarm.globalAlarmId)
          ? { ...alarm, comments: [...alarm.comments, newComment] }
          : alarm
      )
    );
    setSelectedAlarmIds(new Set());
  };

  const handleBulkExport = (alarmIds: string[]) => {
    const selectedAlarms = allAlarms.filter(a => alarmIds.includes(a.globalAlarmId));
    const csv = [
      ['Global ID', 'Severity', 'Title', 'Object', 'Created', 'Duration', 'Team'],
      ...selectedAlarms.map(a => [a.globalAlarmId, a.severity, a.title, a.objectName, a.createdAt, a.duration, a.assignedTeam || 'Unassigned'])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alarms-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSelectedAlarmIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading alarms...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const summaryStats = {
    critical: filteredAlarms.filter(a => a.severity === 'critical').length,
    major: filteredAlarms.filter(a => a.severity === 'major').length,
    unacknowledged: filteredAlarms.filter(a => !a.acknowledged).length,
    total: filteredAlarms.length
  };

  // Incident mode state
  const isIncidentMode = summaryStats.critical >= 5 || summaryStats.major >= 10;
  const incidentRegion = filteredAlarms.length > 0 ? filteredAlarms[0].hierarchy.region : null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top banner with mode indicator */}
      <div className={`${
        timeMode === 'snapshot' ? 'bg-blue-100 border-b-2 border-blue-500' :
        timeMode === 'historical' ? 'bg-purple-100 border-b-2 border-purple-500' :
        'bg-green-100 border-b-2 border-green-500'
      } px-4 py-2`}>
        <div className="flex items-center justify-between max-w-full gap-4">
          <h1 className="text-xs font-bold text-gray-900 whitespace-nowrap">
            {getModeBannerText({ mode: timeMode, lastRefresh, isRefreshing, isPaused } as any)}
          </h1>
          <div className="text-xs font-semibold whitespace-nowrap overflow-x-auto flex gap-4">
            {summaryStats.critical > 0 && (
              <span className="text-red-700">
                🔴 {summaryStats.critical}
              </span>
            )}
            {summaryStats.major > 0 && (
              <span className="text-orange-700">
                🟠 {summaryStats.major}
              </span>
            )}
            <span className="text-gray-700">
              {summaryStats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Alarm Overview Widgets */}
      <div className="px-4 pt-3">
        <AlarmOverviewWidgets
          faultIndex={Math.round((summaryStats.critical / Math.max(summaryStats.total, 1)) * 100)}
          sitesImpacted={Math.floor(Math.random() * 20 + 5)}
          cellsImpacted={Math.floor(Math.random() * 50 + 10)}
          estimatedSubscribers={Math.floor(Math.random() * 5000 + 100)}
          technologiesAffected={['4G', '5G', '3G']}
          clearRate={Math.floor(Math.random() * 40 + 60)}
          clearRateTrend={Math.random() > 0.5 ? 'improving' : 'worsening'}
          onWidgetClick={(widget) => console.log(`Widget clicked: ${widget}`)}
        />
      </div>

      {/* Incident Mode Banner */}
      {isIncidentMode && (
        <div className="relative z-10 bg-red-600 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <h2 className="text-sm font-bold">MAJOR INCIDENT ACTIVE — {incidentRegion || 'Network'}</h2>
          </div>
          <p className="text-xs opacity-90">
            Critical: {summaryStats.critical} | Major: {summaryStats.major}
          </p>
        </div>
      )}

      {/* Alarm Storm Protection */}
      {isStormActive && !dismissStormBanner && (
        <AlarmStormProtection
          isStormDetected={true}
          alarmCountInWindow={allAlarms.length}
          timeWindowMinutes={3}
          onStormAnalyticsClick={() => console.log('Open storm analytics')}
          currentView={stormView}
          onViewChange={setStormView}
          onDismiss={() => setDismissStormBanner(true)}
        />
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden gap-3 p-3">
        {/* Sidebar */}
        <div className="w-72 flex flex-col gap-3 overflow-y-auto">
          {/* Time mode switcher */}
          <TimeModeSwitcher
            currentMode={timeMode}
            isRefreshing={isRefreshing}
            isPaused={isPaused}
            lastRefresh={lastRefresh}
            onModeChange={handleModeChange}
            onPauseToggle={() => setIsPaused(!isPaused)}
          />

          {/* Expert mode toggle */}
          <ExpertModeToggle
            enabled={expertMode}
            onToggle={setExpertMode}
          />

          {/* Object hierarchy */}
          {filteredAlarms.length > 0 && (
            <ObjectHierarchy
              hierarchy={filteredAlarms[0].hierarchy}
              onHierarchyFilter={handleHierarchyFilter}
              currentFilters={hierarchyFilters}
            />
          )}

          {/* Filter panel */}
          <AlarmFilterPanel
            onFiltersChange={setFilters}
          />
        </div>

        {/* Main content - Alarm table */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Bulk operations bar */}
          {selectedAlarmIds.size > 0 && (
            <AlarmBulkOperations
              selectedAlarms={filteredAlarms.filter(a => selectedAlarmIds.has(a.globalAlarmId))}
              onAcknowledge={handleBulkAcknowledge}
              onAssign={handleBulkAssign}
              onAddComment={handleBulkAddComment}
              onExport={handleBulkExport}
              onCancel={() => setSelectedAlarmIds(new Set())}
            />
          )}

          {filteredAlarms.length === 0 ? (
            <div className="flex items-center justify-center flex-1 bg-white rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-2">No alarms found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
              <AlarmTable
                alarms={filteredAlarms}
                expertMode={expertMode}
                onAlarmSelect={(alarm) => {
                  setInspectionAlarm(alarm);
                  setSelectedAlarm(null);
                }}
                onObjectClick={(objectName, objectType) => {
                  console.log(`Navigate to ${objectType}: ${objectName}`);
                }}
                selectedAlarmIds={selectedAlarmIds}
                onSelectionChange={setSelectedAlarmIds}
              />
            </div>
          )}
        </div>
      </div>

      {/* Show full details page if requested */}
      {viewFullDetails && inspectionAlarm && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <AlarmDetailsPage alarm={inspectionAlarm} />
          <button
            onClick={() => setViewFullDetails(false)}
            className="fixed top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 z-10"
          >
            Close Details
          </button>
        </div>
      )}

      {/* Side Inspection Panel */}
      {inspectionAlarm && !viewFullDetails && (
        <AlarmSideInspectionPanel
          alarm={inspectionAlarm}
          onClose={() => setInspectionAlarm(null)}
          onViewFullDetails={() => setViewFullDetails(true)}
        />
      )}

      {/* Original alarm details side panel (kept for backwards compatibility) */}
      {selectedAlarm && (
        <AlarmDetailsSidePanel
          alarm={selectedAlarm}
          onClose={() => setSelectedAlarm(null)}
          onAddComment={handleAddComment}
          expertMode={expertMode}
        />
      )}
    </div>
  );
};
