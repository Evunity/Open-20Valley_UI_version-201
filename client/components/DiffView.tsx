import React, { useState } from 'react';
import { ArrowRight, Download, Check } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

interface DiffViewProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface ConfigDiff {
  parameter: string;
  left: {
    label: string;
    value: string;
  };
  right: {
    label: string;
    value: string;
  };
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
  const [leftSite, setLeftSite] = useState<string[]>(['Cairo-Site-1']);
  const [rightSite, setRightSite] = useState<string[]>(['Cairo-Site-2']);
  const [timePeriod, setTimePeriod] = useState<string[]>(['Current vs Previous Hour']);
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set(PARAMETER_OPTIONS));

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

  const getStatusColor = (status: string) => {
    const colors = {
      'identical': 'surface-success border',
      'different': 'surface-destructive border',
      'missing_left': 'surface-warning border',
      'missing_right': 'surface-warning border'
    };
    return colors[status as keyof typeof colors] || colors.identical;
  };

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

      {/* Site Selection */}
      <div className="grid grid-cols-3 gap-3 items-end">
        <SearchableDropdown
          label={compareType === 'same-site' ? 'Site' : 'Left Site'}
          options={SITE_OPTIONS}
          selected={leftSite}
          onChange={setLeftSite}
          placeholder={compareType === 'same-site' ? 'Select site...' : 'Select left site...'}
          multiSelect={false}
          searchable={true}
          compact={true}
        />

        <div className="flex justify-center">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {compareType === 'different-sites' && (
          <SearchableDropdown
            label="Right Site"
            options={SITE_OPTIONS}
            selected={rightSite}
            onChange={setRightSite}
            placeholder="Select right site..."
            multiSelect={false}
            searchable={true}
            compact={true}
          />
        )}
        {compareType === 'same-site' && (
          <SearchableDropdown
            label="Time Period"
            options={['Current vs Previous Hour', 'Current vs Today', 'Today vs Yesterday', 'This Week vs Last Week']}
            selected={timePeriod}
            onChange={setTimePeriod}
            placeholder="Select time period..."
            multiSelect={false}
            searchable={true}
            compact={true}
          />
        )}
      </div>

      {/* Parameter Selection */}
      <div className="bg-card rounded-lg p-4 border border-border space-y-3">
        <div className="flex items-center justify-between">
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
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PARAMETER_OPTIONS.map(param => (
            <button
              key={param}
              onClick={() => toggleParameter(param)}
              className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm transition ${
                selectedParameters.has(param)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted'
              }`}
            >
              {param}
            </button>
          ))}
        </div>
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

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{diff.left.label}</p>
                <p className="text-sm font-mono bg-card p-2 rounded border border-border text-foreground">
                  {diff.left.value}
                </p>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{diff.right.label}</p>
                <p className="text-sm font-mono bg-card p-2 rounded border border-border text-foreground">
                  {diff.right.value}
                </p>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Export */}
      <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold flex items-center justify-center gap-2 transition shadow-sm">
        <Download className="w-4 h-4" />
        Export Diff Report
      </button>
    </div>
  );
};
