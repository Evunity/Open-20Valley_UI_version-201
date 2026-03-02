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
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AlarmManagement: React.FC = () => {
  // State management
  const [allAlarms, setAllAlarms] = useState<Alarm[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  const isStormActive = detectAlarmStorm(allAlarms.length, 3, 50);

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

    if (filters.severity.length > 0) {
      filtered = filtered.filter(alarm => filters.severity.includes(alarm.severity));
    }

    if (filters.alarmType.length > 0) {
      filtered = filtered.filter(alarm => filters.alarmType.includes(alarm.alarmType));
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(alarm => filters.category.includes(alarm.category));
    }

    if (filters.technologies.length > 0) {
      filtered = filtered.filter(alarm =>
        alarm.technologies.some(tech => filters.technologies.includes(tech))
      );
    }

    if (filters.sourceSystem.length > 0) {
      filtered = filtered.filter(alarm => filters.sourceSystem.includes(alarm.sourceSystem));
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(alarm =>
        alarm.title.toLowerCase().includes(searchLower) ||
        alarm.description.toLowerCase().includes(searchLower) ||
        alarm.objectName.toLowerCase().includes(searchLower) ||
        alarm.globalAlarmId.toLowerCase().includes(searchLower)
      );
    }

    if (filters.showAcknowledgedOnly) {
      filtered = filtered.filter(alarm => alarm.acknowledged);
    }
    if (filters.showUnacknowledgedOnly) {
      filtered = filtered.filter(alarm => !alarm.acknowledged);
    }

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
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // Refresh data
  const refreshData = useCallback(() => {
    if (timeMode !== 'live' || isPaused) return;
    
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefresh(getCurrentTimeFormatted());
      setIsRefreshing(false);
      
      setAllAlarms(alarms =>
        alarms.map(alarm => ({
          ...alarm,
          duration: calculateDuration(alarm.createdAt, alarm.updatedAt)
        }))
      );
    }, 500);
  }, [timeMode, isPaused]);

  // Set up auto-refresh
  useEffect(() => {
    if (timeMode !== 'live') {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    refreshData();
    refreshIntervalRef.current = setInterval(() => {
      refreshData();
    }, 5000);

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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading alarms...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const summaryStats = {
    critical: filteredAlarms.filter(a => a.severity === 'critical').length,
    major: filteredAlarms.filter(a => a.severity === 'major').length,
    minor: filteredAlarms.filter(a => a.severity === 'minor').length,
    unacknowledged: filteredAlarms.filter(a => !a.acknowledged).length,
    total: filteredAlarms.length
  };

  const isIncidentMode = summaryStats.critical >= 5 || summaryStats.major >= 10;
  const incidentRegion = filteredAlarms.length > 0 ? filteredAlarms[0].hierarchy.region : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Compact Top Bar */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Mode and Status */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold ${
              timeMode === 'snapshot' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
              timeMode === 'historical' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
              'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                timeMode === 'live' ? 'bg-green-600' : 'bg-gray-600'
              }`}></span>
              {timeMode.toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground">{lastRefresh}</span>
          </div>

          {/* Alarm Counts */}
          <div className="flex items-center gap-4 text-sm">
            {summaryStats.critical > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span className="font-semibold text-red-700 dark:text-red-400">{summaryStats.critical}</span>
              </div>
            )}
            {summaryStats.major > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                <span className="font-semibold text-orange-700 dark:text-orange-400">{summaryStats.major}</span>
              </div>
            )}
            {summaryStats.minor > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>
                <span className="font-semibold text-yellow-700 dark:text-yellow-400">{summaryStats.minor}</span>
              </div>
            )}
            <div className="border-l border-border pl-4">
              <span className="text-foreground font-medium">{summaryStats.total} Total</span>
            </div>
          </div>
        </div>

        {/* Incident Banner */}
        {isIncidentMode && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚨</span>
              <span className="font-bold">MAJOR INCIDENT — {incidentRegion || 'Network'}</span>
            </div>
            <span className="text-xs font-semibold">Critical: {summaryStats.critical} | Major: {summaryStats.major}</span>
          </div>
        )}
      </div>

      {/* Alarm Storm Banner */}
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

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden gap-0 bg-background">
        {/* Left Sidebar - Collapsible */}
        <div className={`transition-all duration-200 flex flex-col bg-card border-r border-border overflow-hidden ${
          sidebarCollapsed ? 'w-0' : 'w-80'
        }`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <TimeModeSwitcher
              currentMode={timeMode}
              isRefreshing={isRefreshing}
              isPaused={isPaused}
              lastRefresh={lastRefresh}
              onModeChange={handleModeChange}
              onPauseToggle={() => setIsPaused(!isPaused)}
            />

            <ExpertModeToggle
              enabled={expertMode}
              onToggle={setExpertMode}
            />

            {filteredAlarms.length > 0 && (
              <ObjectHierarchy
                hierarchy={filteredAlarms[0].hierarchy}
                onHierarchyFilter={handleHierarchyFilter}
                currentFilters={hierarchyFilters}
              />
            )}

            <AlarmFilterPanel
              onFiltersChange={setFilters}
            />
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-8 flex items-center justify-center hover:bg-muted transition-colors border-r border-border"
          title={sidebarCollapsed ? "Show filters" : "Hide filters"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Main Alarm List Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
          {/* Bulk Operations Bar */}
          {selectedAlarmIds.size > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg">
              <AlarmBulkOperations
                selectedAlarms={filteredAlarms.filter(a => selectedAlarmIds.has(a.globalAlarmId))}
                onAcknowledge={handleBulkAcknowledge}
                onAssign={handleBulkAssign}
                onAddComment={handleBulkAddComment}
                onExport={handleBulkExport}
                onCancel={() => setSelectedAlarmIds(new Set())}
              />
            </div>
          )}

          {/* Alarm Table */}
          {filteredAlarms.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-card rounded-lg border border-dashed border-border">
              <div className="text-center">
                <p className="text-foreground font-semibold mb-1">No alarms found</p>
                <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
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

      {/* Full Details Page */}
      {viewFullDetails && inspectionAlarm && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <AlarmDetailsPage alarm={inspectionAlarm} />
          <button
            onClick={() => setViewFullDetails(false)}
            className="fixed top-4 right-4 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded z-10"
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

      {/* Original Alarm Details Side Panel */}
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
