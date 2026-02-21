import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import {
  AlarmSeverity,
  AlarmType,
  AlarmCategory,
  Technology,
  SourceSystem,
  getSeverityIcon,
  getSeverityTextColor
} from '../utils/alarmData';

interface AlarmFilterPanelProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  severity: AlarmSeverity[];
  alarmType: AlarmType[];
  category: AlarmCategory[];
  technologies: Technology[];
  sourceSystem: SourceSystem[];
  searchText: string;
  showAcknowledgedOnly: boolean;
  showUnacknowledgedOnly: boolean;
}

const SEVERITY_OPTIONS: AlarmSeverity[] = ['critical', 'major', 'minor', 'warning', 'info', 'cleared'];
const ALARM_TYPE_OPTIONS: AlarmType[] = ['equipment', 'communications', 'quality_of_service', 'processing_error', 'environmental'];
const CATEGORY_OPTIONS: AlarmCategory[] = ['accessibility', 'performance', 'configuration', 'security', 'maintenance'];
const TECHNOLOGY_OPTIONS: Technology[] = ['2G', '3G', '4G', '5G', 'FTTx', 'IP', 'OpenRAN'];
const SOURCE_SYSTEM_OPTIONS: SourceSystem[] = ['Huawei', 'Ericsson', 'Nokia', 'OpenRAN_SMO'];

export const AlarmFilterPanel: React.FC<AlarmFilterPanelProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    severity: ['critical', 'major'], // Default to critical and major
    alarmType: [],
    category: [],
    technologies: [],
    sourceSystem: [],
    searchText: '',
    showAcknowledgedOnly: false,
    showUnacknowledgedOnly: false
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['severity', 'alarmType', 'sourceSystem'])
  );

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  const toggleOption = (key: keyof Pick<FilterState, 'severity' | 'alarmType' | 'category' | 'technologies' | 'sourceSystem'>, value: any) => {
    const newFilters = { ...filters };
    const arr = newFilters[key] as any[];
    const index = arr.indexOf(value);

    if (index > -1) {
      arr.splice(index, 1);
    } else {
      arr.push(value);
    }

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, searchText: e.target.value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAcknowledgedToggle = (acknowledged: boolean) => {
    const newFilters = {
      ...filters,
      showAcknowledgedOnly: acknowledged,
      showUnacknowledgedOnly: !acknowledged && !filters.showAcknowledgedOnly ? false : filters.showUnacknowledgedOnly
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterState = {
      severity: [],
      alarmType: [],
      category: [],
      technologies: [],
      sourceSystem: [],
      searchText: '',
      showAcknowledgedOnly: false,
      showUnacknowledgedOnly: false
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFilterCount = [
    ...filters.severity,
    ...filters.alarmType,
    ...filters.category,
    ...filters.technologies,
    ...filters.sourceSystem
  ].length + (filters.searchText ? 1 : 0);

  const FilterSection = ({
    title,
    section,
    options,
    selectedKey,
    count
  }: {
    title: string;
    section: string;
    options: any[];
    selectedKey: keyof Pick<FilterState, 'severity' | 'alarmType' | 'category' | 'technologies' | 'sourceSystem'>;
    count: number;
  }) => {
    const isExpanded = expandedSections.has(section);
    const selectedCount = filters[selectedKey].length;

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(section)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{title}</span>
            {selectedCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {selectedCount}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {isExpanded && (
          <div className="px-4 py-3 bg-gray-50 space-y-2 border-t border-gray-200">
            {options.map(option => (
              <label key={option} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters[selectedKey].includes(option)}
                  onChange={() => toggleOption(selectedKey, option)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {selectedKey === 'severity' && (
                    <span className="flex items-center gap-2">
                      <span>{getSeverityIcon(option as AlarmSeverity)}</span>
                      <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                    </span>
                  )}
                  {selectedKey !== 'severity' && (
                    option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Filters</h2>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search alarms..."
            value={filters.searchText}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {filters.searchText && (
            <button
              onClick={() => {
                const newFilters = { ...filters, searchText: '' };
                setFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active filters and clear button */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600">
              {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter sections */}
      <div className="flex-1 overflow-y-auto">
        <FilterSection
          title="Severity"
          section="severity"
          options={SEVERITY_OPTIONS}
          selectedKey="severity"
          count={SEVERITY_OPTIONS.length}
        />

        <FilterSection
          title="Type"
          section="alarmType"
          options={ALARM_TYPE_OPTIONS}
          selectedKey="alarmType"
          count={ALARM_TYPE_OPTIONS.length}
        />

        <FilterSection
          title="Category"
          section="category"
          options={CATEGORY_OPTIONS}
          selectedKey="category"
          count={CATEGORY_OPTIONS.length}
        />

        <FilterSection
          title="Technology"
          section="technologies"
          options={TECHNOLOGY_OPTIONS}
          selectedKey="technologies"
          count={TECHNOLOGY_OPTIONS.length}
        />

        <FilterSection
          title="Source System"
          section="sourceSystem"
          options={SOURCE_SYSTEM_OPTIONS}
          selectedKey="sourceSystem"
          count={SOURCE_SYSTEM_OPTIONS.length}
        />

        {/* Acknowledgment status */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('acknowledgment')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="font-semibold text-gray-800">Status</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.has('acknowledgment') ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.has('acknowledgment') && (
            <div className="px-4 py-3 bg-gray-50 space-y-2 border-t border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.showUnacknowledgedOnly}
                  onChange={() => handleAcknowledgedToggle(false)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Unacknowledged
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.showAcknowledgedOnly}
                  onChange={() => handleAcknowledgedToggle(true)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Acknowledged
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
