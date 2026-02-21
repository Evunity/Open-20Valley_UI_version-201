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

  // Calculate summary stats
  const summaryStats = {
    critical: filteredAlarms.filter(a => a.severity === 'critical').length,
    major: filteredAlarms.filter(a => a.severity === 'major').length,
    unacknowledged: filteredAlarms.filter(a => !a.acknowledged).length,
    total: filteredAlarms.length
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top banner with mode indicator */}
      <div className={`${
        timeMode === 'snapshot' ? 'bg-blue-100 border-b-2 border-blue-500' :
        timeMode === 'historical' ? 'bg-purple-100 border-b-2 border-purple-500' :
        'bg-green-100 border-b-2 border-green-500'
      } px-6 py-3`}>
        <div className="flex items-center justify-between max-w-full">
          <h1 className="text-lg font-bold text-gray-900">
            {getModeBannerText({ mode: timeMode, lastRefresh, isRefreshing, isPaused } as any)}
          </h1>
          <div className="text-sm font-semibold">
            {summaryStats.critical > 0 && (
              <span className="text-red-700 mr-6">
                🔴 {summaryStats.critical} Critical
              </span>
            )}
            {summaryStats.major > 0 && (
              <span className="text-orange-700 mr-6">
                🟠 {summaryStats.major} Major
              </span>
            )}
            <span className="text-gray-700">
              Total: {summaryStats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
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
                onAlarmSelect={setSelectedAlarm}
                onObjectClick={(objectName, objectType) => {
                  console.log(`Navigate to ${objectType}: ${objectName}`);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Alarm details side panel */}
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
