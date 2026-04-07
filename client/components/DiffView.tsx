import React, { useState, useRef } from 'react';
import { ArrowRight, Download, Check, Search, X, ChevronDown } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface DiffViewProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface SiteValue {
  label: string;
  value: string;
}

interface ConfigDiff {
  parameter: string;
  left: SiteValue;
  right: SiteValue;
  middle1?: SiteValue;
  middle2?: SiteValue;
  status: 'identical' | 'different' | 'missing_left' | 'missing_right';
}

const SITE_OPTIONS = ['Cairo-Site-1', 'Cairo-Site-2', 'Cairo-Site-3', 'Giza-Site-1', 'Giza-Site-2', 'Alexandria-Site-1', 'Suez-Site-1'];

const PARAMETER_OPTIONS = ['TX Power', 'DL Bandwidth', 'Cell Barring', 'IP Address', 'VLAN ID', 'RRC Idle Count', 'PDCP Count', 'Handover Rate'];

const MOCK_DIFFS: ConfigDiff[] = [
  {
    parameter: 'TX Power',
    left: { label: 'Cairo-Site-1', value: '43 dBm' },
    right: { label: 'Cairo-Site-2', value: '40 dBm' },
    status: 'different'
  },
  {
    parameter: 'DL Bandwidth',
    left: { label: 'Cairo-Site-1', value: '20 MHz' },
    right: { label: 'Cairo-Site-2', value: '20 MHz' },
    status: 'identical'
  },
  {
    parameter: 'Cell Barring',
    left: { label: 'Cairo-Site-1', value: 'False' },
    right: { label: 'Cairo-Site-2', value: 'False' },
    status: 'identical'
  },
  {
    parameter: 'IP Address',
    left: { label: 'Cairo-Site-1', value: '192.168.1.100' },
    right: { label: 'Cairo-Site-2', value: '192.168.1.101' },
    status: 'different'
  },
  {
    parameter: 'VLAN ID',
    left: { label: 'Cairo-Site-1', value: '100' },
    right: { label: 'Cairo-Site-2', value: 'Not configured' },
    status: 'missing_right'
  },
  {
    parameter: 'RRC Idle Count',
    left: { label: 'Cairo-Site-1', value: '1250' },
    right: { label: 'Cairo-Site-1 (Time-2)', value: '1260' },
    status: 'different'
  },
  {
    parameter: 'PDCP Count',
    left: { label: 'Cairo-Site-1', value: '5600' },
    right: { label: 'Cairo-Site-1 (Time-2)', value: '5600' },
    status: 'identical'
  },
  {
    parameter: 'Handover Rate',
    left: { label: 'Cairo-Site-1', value: '2.5%' },
    right: { label: 'Cairo-Site-1 (Time-2)', value: '2.8%' },
    status: 'different'
  }
];

export const DiffView: React.FC<DiffViewProps> = () => {
  const [diffs] = useState<ConfigDiff[]>(MOCK_DIFFS);
  const [compareType, setCompareType] = useState<'different-sites' | 'same-site'>('different-sites');
  const [siteCount, setSiteCount] = useState<2 | 3 | 4>(2);
  const [selectedSites, setSelectedSites] = useState<string[]>(['Cairo-Site-1', 'Cairo-Site-2']);
  const [timePeriod, setTimePeriod] = useState<string[]>(['Current vs Previous Hour']);
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set(PARAMETER_OPTIONS));
  const [parameterSearch, setParameterSearch] = useState('');
  const [showParameterDropdown, setShowParameterDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const parameterDropdownRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const handleSiteCountChange = (count: 2 | 3 | 4) => {
    setSiteCount(count);
    if (selectedSites.length > count) {
      setSelectedSites(selectedSites.slice(0, count));
    } else if (selectedSites.length < count) {
      // Add new sites if needed
      const newSites = [...selectedSites];
      while (newSites.length < count) {
        const availableSite = SITE_OPTIONS.find(s => !newSites.includes(s));
        if (availableSite) newSites.push(availableSite);
        else break;
      }
      setSelectedSites(newSites);
    }
  };

  const handleSiteChange = (index: number, site: string) => {
    const newSites = [...selectedSites];
    newSites[index] = site;
    setSelectedSites(newSites);
  };

  const filteredDiffs = diffs.filter(d => selectedParameters.has(d.parameter));
  const differentCount = filteredDiffs.filter(d => d.status === 'different').length;
  const identicalCount = filteredDiffs.filter(d => d.status === 'identical').length;

  const toggleParameter = (param: string) => {
    const newSelected = new Set(selectedParameters);
    if (newSelected.has(param)) {
      newSelected.delete(param);
    } else {
      newSelected.add(param);
    }
    setSelectedParameters(newSelected);
  };

  const selectAllParameters = () => {
    setSelectedParameters(new Set(PARAMETER_OPTIONS));
  };

  const clearAllParameters = () => {
    setSelectedParameters(new Set());
  };

  React.useEffect(() => {
    if (!showParameterDropdown) return;

    const handlePointerDownOutside = (event: MouseEvent) => {
      if (!parameterDropdownRef.current?.contains(event.target as Node)) {
        setShowParameterDropdown(false);
      }
    };

    const handleEscapeClose = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowParameterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('keydown', handleEscapeClose);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleEscapeClose);
    };
  }, [showParameterDropdown]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'identical': return 'Identical';
      case 'different': return 'Different';
      case 'missing_left': return 'Missing in Left';
      case 'missing_right': return 'Missing in Right';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'identical': 'surface-success border',
      'different': 'surface-destructive border',
      'missing_left': 'surface-warning border',
      'missing_right': 'surface-warning border'
    };
    return colors[status as keyof typeof colors] || colors.identical;
  };

  const exportToCSV = () => {
    if (filteredDiffs.length === 0) {
      alert('No data to export. Please select at least one parameter.');
      return;
    }

    const csvData = filteredDiffs.map(diff => {
      const row: any = {
        'Parameter': diff.parameter,
        'Status': getStatusLabel(diff.status)
      };

      // Add site values dynamically based on siteCount
      row[`${diff.left.label}`] = diff.left.value;
      if (diff.middle1) row[`${diff.middle1.label}`] = diff.middle1.value;
      if (diff.middle2) row[`${diff.middle2.label}`] = diff.middle2.value;
      row[`${diff.right.label}`] = diff.right.value;

      return row;
    });

    const headers = Object.keys(csvData[0]);
    const rows = csvData.map(obj => headers.map(header => {
      const value = obj[header];
      const stringValue = String(value);
      return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
    }));

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const link = document.createElement('a');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `diff_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    if (filteredDiffs.length === 0) {
      alert('No data to export. Please select at least one parameter.');
      return;
    }

    const excelData = filteredDiffs.map(diff => {
      const row: any = {
        'Parameter': diff.parameter,
        'Status': getStatusLabel(diff.status)
      };

      // Add site values dynamically based on siteCount
      row[`${diff.left.label}`] = diff.left.value;
      if (diff.middle1) row[`${diff.middle1.label}`] = diff.middle1.value;
      if (diff.middle2) row[`${diff.middle2.label}`] = diff.middle2.value;
      row[`${diff.right.label}`] = diff.right.value;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Diff Report');

    // Style header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center' }
      };
    }

    // Set column widths - dynamic based on site count
    const colWidths = Array(siteCount + 2).fill({ wch: 18 });
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `diff_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  React.useEffect(() => {
    if (!showExportMenu) return;

    const handlePointerDownOutside = (event: MouseEvent) => {
      if (!exportMenuRef.current?.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    return () => document.removeEventListener('mousedown', handlePointerDownOutside);
  }, [showExportMenu]);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Comparison Type */}
      <div className="flex gap-3">
        <button
          onClick={() => setCompareType('different-sites')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition border-2 ${
            compareType === 'different-sites'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40'
          }`}
        >
          Compare Different Sites
        </button>
        <button
          onClick={() => setCompareType('same-site')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition border-2 ${
            compareType === 'same-site'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40'
          }`}
        >
          Compare Within Site (Time)
        </button>
      </div>

      {/* Site Selection - Improved UI/UX */}
      {compareType === 'different-sites' && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Site Count Selector */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Comparison Mode</h3>
              <p className="text-xs text-muted-foreground mt-1">Select how many sites to compare</p>
            </div>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map(count => (
                <button
                  key={count}
                  onClick={() => handleSiteCountChange(count)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition ${
                    siteCount === count
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-background border-border hover:border-primary/40 text-foreground hover:bg-muted'
                  }`}
                >
                  {count} Sites
                </button>
              ))}
            </div>
          </div>

          {/* Sites Comparison Cards */}
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${siteCount}, 1fr)` }}>
            {selectedSites.map((site, index) => {
              const siteColors = [
                'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20',
                'border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-950/20',
                'border-l-4 border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/20',
                'border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-950/20'
              ];

              const siteColorLabel = [
                'text-blue-700 dark:text-blue-300',
                'text-green-700 dark:text-green-300',
                'text-orange-700 dark:text-orange-300',
                'text-purple-700 dark:text-purple-300'
              ];

              return (
                <div key={index} className={`rounded-lg border border-border p-3 space-y-2 ${siteColors[index]}`}>
                  <div>
                    <label className={`block text-xs font-bold ${siteColorLabel[index]} mb-2`}>
                      SITE {index + 1}
                    </label>
                    <SearchableDropdown
                      label=""
                      options={SITE_OPTIONS}
                      selected={[site]}
                      onChange={(selected) => handleSiteChange(index, selected[0])}
                      placeholder="Select site..."
                      multiSelect={false}
                      searchable={true}
                      compact={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Info */}
          <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold">Comparing:</span>
            <span className="font-mono bg-muted px-2 py-1 rounded">
              {selectedSites.join(' vs ')}
            </span>
          </div>
        </div>
      )}

      {compareType === 'same-site' && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Time-Based Comparison</h3>

          <div className="grid grid-cols-2 gap-4 items-end">
            {/* Site Selection */}
            <div className="rounded-lg border border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20 p-3 space-y-2">
              <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">SITE</label>
              <SearchableDropdown
                label=""
                options={SITE_OPTIONS}
                selected={selectedSites.slice(0, 1)}
                onChange={(selected) => handleSiteChange(0, selected[0])}
                placeholder="Select site..."
                multiSelect={false}
                searchable={true}
                compact={true}
              />
            </div>

            {/* Time Period Selection */}
            <div className="rounded-lg border border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-950/20 p-3 space-y-2">
              <label className="block text-xs font-bold text-green-700 dark:text-green-300 mb-2">TIME PERIOD</label>
              <SearchableDropdown
                label=""
                options={['Current vs Previous Hour', 'Current vs Today', 'Today vs Yesterday', 'This Week vs Last Week']}
                selected={timePeriod}
                onChange={setTimePeriod}
                placeholder="Select time period..."
                multiSelect={false}
                searchable={true}
                compact={true}
              />
            </div>
          </div>

          {/* Comparison Info */}
          <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold">Comparing:</span>
            <span className="font-mono bg-muted px-2 py-1 rounded">
              {selectedSites[0]} across {timePeriod[0]}
            </span>
          </div>
        </div>
      )}

      {/* Parameter Selection - KPI Selector Style */}
      <div className="bg-card rounded-lg p-4 border border-border space-y-3">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-foreground">Select Parameters</label>
          <div className="flex gap-2">
            <button
              onClick={selectAllParameters}
              className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-semibold transition"
            >
              Select All
            </button>
            <button
              onClick={clearAllParameters}
              className="text-xs px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-lg text-destructive font-semibold transition"
            >
              Clear All
            </button>

            {/* Export Dropdown */}
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={filteredDiffs.length === 0}
                className="text-xs px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 rounded-lg text-green-700 dark:text-green-400 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Export
                <ChevronDown className={cn("w-3 h-3 transition-transform", showExportMenu && "rotate-180")} />
              </button>

              {/* Export Menu Dropdown */}
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden min-w-[140px]">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted transition-colors border-b border-border/50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Parameter Search Bar */}
        <div ref={parameterDropdownRef} className="relative">
          <div className={cn("bg-card border rounded p-1.5 flex items-center gap-1.5 transition-all shadow-sm", showParameterDropdown ? "border-primary ring-1 ring-primary/30 shadow-md" : "border-border hover:border-primary/30")}>
            <Search className="w-3.5 h-3.5 text-primary flex-shrink-0 stroke-2" />
            <input
              type="text"
              placeholder="Search parameters..."
              value={parameterSearch}
              onChange={(e) => {
                setParameterSearch(e.target.value);
                setShowParameterDropdown(true);
              }}
              onFocus={() => setShowParameterDropdown(true)}
              className="flex-1 bg-transparent border-0 text-xs text-foreground placeholder-muted-foreground/70 focus:outline-none font-medium"
            />
            {parameterSearch && (
              <button
                onClick={() => setParameterSearch('')}
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 hover:bg-muted/50 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Parameter Dropdown */}
          {showParameterDropdown && (
            <>
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-primary/40 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                {PARAMETER_OPTIONS.filter(p => p.toLowerCase().includes(parameterSearch.toLowerCase())).length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {PARAMETER_OPTIONS.filter(p => p.toLowerCase().includes(parameterSearch.toLowerCase())).map((param) => {
                      const isSelected = selectedParameters.has(param);
                      return (
                        <button
                          key={param}
                          onClick={() => toggleParameter(param)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 text-xs transition-all flex items-start gap-2 hover:bg-muted/40",
                            isSelected ? "bg-primary/10 border-l-2 border-l-primary" : ""
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center", isSelected ? "bg-primary border-primary" : "border-border")}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs text-foreground">{param}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-xs text-muted-foreground">
                    No parameters match your search
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Selected Parameters Count */}
        {selectedParameters.size > 0 && (
          <div className="text-xs text-muted-foreground font-medium">
            {selectedParameters.size} of {PARAMETER_OPTIONS.length} selected
          </div>
        )}
      </div>

      {/* Diff Summary */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-card rounded-lg border border-border">
        <div>
          <p className="text-xs font-semibold text-green-600 dark:text-green-400">Identical</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{identicalCount}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">Different</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{differentCount}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Total Parameters</p>
          <p className="text-2xl font-bold text-foreground mt-1">{filteredDiffs.length}</p>
        </div>
      </div>

      {/* Diff List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {selectedParameters.size === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Please select at least one parameter to compare</p>
          </div>
        ) : (
          filteredDiffs.map((diff, i) => (
          <div
            key={i}
            className={`border-2 rounded-lg p-3 transition ${getStatusColor(diff.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-foreground">{diff.parameter}</p>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                diff.status === 'identical' ? 'surface-success border' :
                diff.status === 'different' ? 'surface-destructive border' :
                'surface-warning border'
              }`}>
                {diff.status === 'identical' ? '✓ Same' :
                 diff.status === 'different' ? '✗ Different' :
                 diff.status === 'missing_left' ? 'Missing in Left' :
                 'Missing in Right'}
              </span>
            </div>

            <div className={`grid gap-3 ${siteCount === 2 ? 'grid-cols-3' : siteCount === 3 ? 'grid-cols-5' : 'grid-cols-7'}`}>
              {[diff.left, diff.middle1, diff.middle2, diff.right].filter(Boolean).map((site, index) => {
                const siteColors = [
                  'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30',
                  'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/30',
                  'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/30',
                  'border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                ];

                const siteColorLabel = [
                  'text-blue-700 dark:text-blue-300',
                  'text-green-700 dark:text-green-300',
                  'text-orange-700 dark:text-orange-300',
                  'text-purple-700 dark:text-purple-300'
                ];

                return (
                  <React.Fragment key={index}>
                    <div className={`rounded-lg border border-border p-3 ${siteColors[index]}`}>
                      <p className={`text-xs font-bold ${siteColorLabel[index]} mb-2 uppercase`}>Site {index + 1}</p>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{site!.label}</p>
                      <p className="text-sm font-mono bg-card p-2 rounded border border-border text-foreground">
                        {site!.value}
                      </p>
                    </div>
                    {index < [diff.left, diff.middle1, diff.middle2, diff.right].filter(Boolean).length - 1 && (
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))
        )}
      </div>

    </div>
  );
};
