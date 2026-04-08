import React, { useState, useRef } from 'react';
import { RotateCcw, Save, CheckCircle, AlertCircle, Eye, Download, X, ChevronDown } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface RollbackAuditCombinedProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface ChangeSnapshot {
  id: string;
  timestamp: string;
  user: string;
  scriptUsed: string;
  objectIds: string[];
  previousConfig: Record<string, Record<string, string>>;
  currentConfig: Record<string, Record<string, string>>;
  status: 'active' | 'rolled_back';
  rollbackableItems: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  object: string;
  site: string;
  technology: string;
  vendor: string;
  status: 'completed' | 'failed' | 'rolled-back';
  changeDetails: string;
  reversible: boolean;
}

interface RollbackPreviewRow {
  objectId: string;
  parameter: string;
  currentValue: string;
  previousValue: string;
}

interface RollbackPreviewModel {
  snapshotId: string | null;
  objectIds: string[];
  parameters: string[];
  rows: RollbackPreviewRow[];
}

const MOCK_SNAPSHOTS: ChangeSnapshot[] = [
  {
    id: 'snap_001',
    timestamp: '2024-12-02 14:32:15',
    user: 'Engineer.A',
    scriptUsed: 'Network Configuration Reset',
    objectIds: ['Cairo-Site-1', 'Cairo-Site-2', 'Cairo-Site-3', 'Giza-Site-1'],
    previousConfig: {
      'Cairo-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.1.100', 'VLAN ID': '100' },
      'Cairo-Site-2': { 'TX Power': '40 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.1.101', 'VLAN ID': '101' },
      'Cairo-Site-3': { 'TX Power': '43 dBm', 'DL Bandwidth': '15 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.1.102', 'VLAN ID': '102' },
      'Giza-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.1.103', 'VLAN ID': '103' }
    },
    currentConfig: {
      'Cairo-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.1.110', 'VLAN ID': '110' },
      'Cairo-Site-2': { 'TX Power': '38 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.1.111', 'VLAN ID': '111' },
      'Cairo-Site-3': { 'TX Power': '40 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.1.112', 'VLAN ID': '112' },
      'Giza-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '15 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.1.113', 'VLAN ID': '113' }
    },
    status: 'active',
    rollbackableItems: 4
  },
  {
    id: 'snap_002',
    timestamp: '2024-12-02 13:45:22',
    user: 'Engineer.B',
    scriptUsed: 'DL Bandwidth Optimization',
    objectIds: ['Alexandria-Site-1', 'Alexandria-Site-2', 'Suez-Site-1'],
    previousConfig: {
      'Alexandria-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.2.100', 'VLAN ID': '200' },
      'Alexandria-Site-2': { 'TX Power': '40 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.2.101', 'VLAN ID': '201' },
      'Suez-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.2.102', 'VLAN ID': '202' }
    },
    currentConfig: {
      'Alexandria-Site-1': { 'TX Power': '38 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.2.110', 'VLAN ID': '210' },
      'Alexandria-Site-2': { 'TX Power': '38 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.2.111', 'VLAN ID': '211' },
      'Suez-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.2.112', 'VLAN ID': '212' }
    },
    status: 'active',
    rollbackableItems: 3
  },
  {
    id: 'snap_003',
    timestamp: '2024-12-02 12:10:45',
    user: 'Engineer.C',
    scriptUsed: 'TX Power Adjustment for Peak Hours',
    objectIds: ['Dubai-Site-1', 'Dubai-Site-2', 'Abu-Dhabi-Site-1', 'Sharjah-Site-1', 'Ajman-Site-1'],
    previousConfig: {
      'Dubai-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.3.100', 'VLAN ID': '300' },
      'Dubai-Site-2': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.3.101', 'VLAN ID': '301' },
      'Abu-Dhabi-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.3.102', 'VLAN ID': '302' },
      'Sharjah-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '15 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.3.103', 'VLAN ID': '303' },
      'Ajman-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.3.104', 'VLAN ID': '304' }
    },
    currentConfig: {
      'Dubai-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.3.120', 'VLAN ID': '320' },
      'Dubai-Site-2': { 'TX Power': '40 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.3.121', 'VLAN ID': '321' },
      'Abu-Dhabi-Site-1': { 'TX Power': '38 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.3.122', 'VLAN ID': '322' },
      'Sharjah-Site-1': { 'TX Power': '38 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.3.123', 'VLAN ID': '323' },
      'Ajman-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.3.124', 'VLAN ID': '324' }
    },
    status: 'active',
    rollbackableItems: 5
  },
  {
    id: 'snap_004',
    timestamp: '2024-12-02 11:20:30',
    user: 'System',
    scriptUsed: 'Auto Emergency Recovery',
    objectIds: ['Riyadh-Site-1', 'Riyadh-Site-2', 'Jeddah-Site-1'],
    previousConfig: {
      'Riyadh-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.4.100', 'VLAN ID': '400' },
      'Riyadh-Site-2': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.4.101', 'VLAN ID': '401' },
      'Jeddah-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.4.102', 'VLAN ID': '402' }
    },
    currentConfig: {
      'Riyadh-Site-1': { 'TX Power': '38 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.4.110', 'VLAN ID': '410' },
      'Riyadh-Site-2': { 'TX Power': '38 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.4.111', 'VLAN ID': '411' },
      'Jeddah-Site-1': { 'TX Power': '36 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.4.112', 'VLAN ID': '412' }
    },
    status: 'rolled_back',
    rollbackableItems: 0
  },
  {
    id: 'snap_005',
    timestamp: '2024-12-02 10:15:45',
    user: 'Engineer.D',
    scriptUsed: 'Multi-Parameter Cell Configuration',
    objectIds: ['Dammam-Site-1', 'Khobar-Site-1'],
    previousConfig: {
      'Dammam-Site-1': { 'TX Power': '43 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.5.100', 'VLAN ID': '500' },
      'Khobar-Site-1': { 'TX Power': '40 dBm', 'DL Bandwidth': '15 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.5.101', 'VLAN ID': '501' }
    },
    currentConfig: {
      'Dammam-Site-1': { 'TX Power': '41 dBm', 'DL Bandwidth': '25 MHz', 'Cell Barring': 'True', 'IP Address': '192.168.5.110', 'VLAN ID': '510' },
      'Khobar-Site-1': { 'TX Power': '38 dBm', 'DL Bandwidth': '20 MHz', 'Cell Barring': 'False', 'IP Address': '192.168.5.111', 'VLAN ID': '511' }
    },
    status: 'active',
    rollbackableItems: 2
  }
];

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2024-12-02 14:32',
    user: 'Engineer.A',
    action: 'Modified TX Power',
    object: 'Cairo-Site-1',
    site: 'Cairo-Site-1',
    technology: '4G',
    vendor: 'Huawei',
    status: 'completed',
    changeDetails: 'TX Power: 43 → 40 dBm',
    reversible: true
  },
  {
    id: '2',
    timestamp: '2024-12-02 13:45',
    user: 'Engineer.B',
    action: 'Bulk Config Update',
    object: 'Cairo-Site-2',
    site: 'Cairo-Site-2',
    technology: '5G',
    vendor: 'Ericsson',
    status: 'completed',
    changeDetails: '12 sites updated',
    reversible: true
  },
  {
    id: '3',
    timestamp: '2024-12-02 12:10',
    user: 'System',
    action: 'Automation Execution',
    object: 'Giza-Site-1',
    site: 'Giza-Site-1',
    technology: '4G',
    vendor: 'Nokia',
    status: 'rolled-back',
    changeDetails: 'Failed validation check',
    reversible: false
  },
  {
    id: '4',
    timestamp: '2024-12-02 11:20',
    user: 'Engineer.A',
    action: 'DL Bandwidth Update',
    object: 'Alexandria-Site-1',
    site: 'Alexandria-Site-1',
    technology: '3G',
    vendor: 'ZTE',
    status: 'completed',
    changeDetails: 'DL Bandwidth: 20 → 25 MHz',
    reversible: true
  },
  {
    id: '5',
    timestamp: '2024-12-02 10:15',
    user: 'Engineer.B',
    action: 'Cell Barring Enable',
    object: 'Suez-Site-1',
    site: 'Suez-Site-1',
    technology: '2G',
    vendor: 'Huawei',
    status: 'failed',
    changeDetails: 'Cell already barred',
    reversible: false
  }
];

const SITE_OPTIONS = ['Cairo-Site-1', 'Cairo-Site-2', 'Cairo-Site-3', 'Giza-Site-1', 'Giza-Site-2', 'Alexandria-Site-1', 'Suez-Site-1'];
const TECHNOLOGY_OPTIONS = ['2G', '3G', '4G', '5G', 'O-RAN'];
const VENDOR_OPTIONS = ['Huawei', 'Ericsson', 'Nokia', 'ZTE'];
const PARAMETER_OPTIONS = ['TX Power', 'DL Bandwidth', 'Cell Barring', 'IP Address', 'VLAN ID'];

export const RollbackAuditCombined: React.FC<RollbackAuditCombinedProps> = () => {
  const [snapshots, setSnapshots] = useState<ChangeSnapshot[]>(MOCK_SNAPSHOTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'full' | 'targeted'>('full');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set());
  const [previewModel, setPreviewModel] = useState<RollbackPreviewModel>({
    snapshotId: null,
    objectIds: [],
    parameters: [],
    rows: []
  });
  const [executionComplete, setExecutionComplete] = useState(false);
  const previewRequestIdRef = useRef(0);

  // Audit state
  const [entries, setEntries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [detailedViewId, setDetailedViewId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const handleModeChange = (mode: 'full' | 'targeted') => {
    setSelectedMode(mode);
    if (mode === 'targeted') {
      resetTargetedWorkspace();
    } else {
      setSelectedObjects(new Set());
      setSelectedParameters(new Set());
    }
  };

  const toggleObject = (objectId: string) => {
    const newSelected = new Set(selectedObjects);
    if (newSelected.has(objectId)) {
      newSelected.delete(objectId);
    } else {
      newSelected.add(objectId);
    }
    setSelectedObjects(newSelected);
  };

  const toggleParameter = (param: string) => {
    const newSelected = new Set(selectedParameters);
    if (newSelected.has(param)) {
      newSelected.delete(param);
    } else {
      newSelected.add(param);
    }
    setSelectedParameters(newSelected);
  };

  const selectedSnapshot = snapshots.find((snapshot) => snapshot.id === selectedSnapshotId) ?? null;
  const selectedObjectList = [...selectedObjects];
  const selectedParameterList = [...selectedParameters];
  const getSafeObjectIds = (snapshot: ChangeSnapshot | null): string[] => {
    if (!snapshot) return [];
    if (Array.isArray(snapshot.objectIds) && snapshot.objectIds.length > 0) return snapshot.objectIds;
    const configObjects = Object.keys(snapshot.currentConfig ?? {});
    return configObjects.length ? configObjects : Object.keys(snapshot.previousConfig ?? {});
  };

  const buildDiffRows = (snapshot: ChangeSnapshot) =>
    getSafeObjectIds(snapshot).flatMap((objectId) =>
      PARAMETER_OPTIONS
        .filter((parameter) => snapshot.currentConfig[objectId]?.[parameter] !== snapshot.previousConfig[objectId]?.[parameter])
        .map((parameter) => ({
          objectId,
          parameter,
          currentValue: snapshot.currentConfig[objectId]?.[parameter] ?? '-',
          previousValue: snapshot.previousConfig[objectId]?.[parameter] ?? '-'
        }))
    );

  const comparisonRows = selectedSnapshot
    ? selectedObjectList.flatMap((objectId) =>
        selectedParameterList.map((parameter) => ({
          objectId,
          parameter,
          currentValue: selectedSnapshot.currentConfig[objectId]?.[parameter] ?? '-',
          previousValue: selectedSnapshot.previousConfig[objectId]?.[parameter] ?? '-'
        }))
      )
    : [];

  const resetTargetedWorkspace = () => {
    previewRequestIdRef.current += 1;
    setSelectedSnapshotId(null);
    setSelectedObjects(new Set());
    setSelectedParameters(new Set());
    setPreviewModel({
      snapshotId: null,
      objectIds: [],
      parameters: [],
      rows: []
    });
    setExpandedId(null);
    setExecutionComplete(false);
  };

  const handleSnapshotSelect = (snapshot: ChangeSnapshot) => {
    console.log('[Rollback] Snapshot selected:', snapshot.id, snapshot);

    // Hard reset stale workspace state before loading next preview
    previewRequestIdRef.current += 1;
    const requestId = previewRequestIdRef.current;
    setSelectedMode('targeted');
    setExecutionComplete(false);
    setExpandedId(null);
    setSelectedSnapshotId(snapshot.id);
    setSelectedObjects(new Set());
    setSelectedParameters(new Set());
    setPreviewModel({
      snapshotId: snapshot.id,
      objectIds: [],
      parameters: [],
      rows: []
    });

    Promise.resolve().then(() => {
      if (requestId !== previewRequestIdRef.current) return;
      const diffRows = buildDiffRows(snapshot);
      const derivedObjects = new Set(diffRows.map((row) => row.objectId));
      const derivedParameters = new Set(diffRows.map((row) => row.parameter));
      const fallbackObjects = getSafeObjectIds(snapshot);

      const nextObjects = derivedObjects.size ? derivedObjects : new Set(fallbackObjects);
      const nextParameters = derivedParameters.size ? derivedParameters : new Set(PARAMETER_OPTIONS);

      console.log('[Rollback] Preview derived:', {
        requestId,
        diffRows: diffRows.length,
        objects: [...nextObjects],
        parameters: [...nextParameters]
      });

      setSelectedObjects(nextObjects);
      setSelectedParameters(nextParameters);
      setPreviewModel({
        snapshotId: snapshot.id,
        objectIds: [...nextObjects],
        parameters: [...nextParameters],
        rows: diffRows
      });
    });
  };

  const executeRollback = () => {
    if (!selectedSnapshotId) {
      alert('Please select one snapshot to rollback');
      return;
    }
    if (selectedMode === 'targeted' && selectedObjects.size === 0) {
      alert('Please select at least one object for targeted rollback');
      return;
    }
    if (selectedMode === 'targeted' && selectedParameters.size === 0) {
      alert('Please select at least one parameter for targeted rollback');
      return;
    }

    setSnapshots(snapshots.map(s =>
      s.id === selectedSnapshotId ? { ...s, status: 'rolled_back' } : s
    ));
    setExecutionComplete(true);
    alert(
      selectedMode === 'full'
        ? `Full rollback executed for snapshot ${selectedSnapshotId}`
        : `Targeted rollback executed for snapshot ${selectedSnapshotId} on ${selectedObjects.size} object(s) and ${selectedParameters.size} parameter(s)`
    );
    if (selectedMode === 'targeted') {
      resetTargetedWorkspace();
    } else {
      setSelectedObjects(new Set());
      setSelectedParameters(new Set());
    }
  };

  const filteredEntries = entries.filter(entry => {
    const siteMatch = !selectedSite.length || entry.site === selectedSite[0];
    const techMatch = !selectedTechnology.length || entry.technology === selectedTechnology[0];
    const vendorMatch = !selectedVendor.length || entry.vendor === selectedVendor[0];
    return siteMatch && techMatch && vendorMatch;
  });

  const handleViewFullDetails = (entryId: string) => {
    setDetailedViewId(detailedViewId === entryId ? null : entryId);
  };

  const handleAuditRollback = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    if (window.confirm(`Are you sure you want to rollback "${entry.action}"?`)) {
      setEntries(entries.map(e =>
        e.id === entryId ? { ...e, status: 'rolled-back' as const, reversible: false } : e
      ));
      setSelectedEntry(null);
      alert(`Rollback completed successfully for "${entry.action}"`);
    }
  };

  const exportToCSV = () => {
    if (filteredEntries.length === 0) {
      alert('No audit entries to export');
      return;
    }

    const csvData = filteredEntries.map(entry => ({
      'Timestamp': entry.timestamp,
      'User': entry.user,
      'Action': entry.action,
      'Object': entry.object,
      'Site': entry.site,
      'Technology': entry.technology,
      'Vendor': entry.vendor,
      'Status': entry.status,
      'Change Details': entry.changeDetails,
      'Reversible': entry.reversible ? 'Yes' : 'No'
    }));

    const headers = Object.keys(csvData[0]);
    const rows = csvData.map(obj => headers.map(header => {
      const value = obj[header as keyof typeof obj];
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
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    if (filteredEntries.length === 0) {
      alert('No audit entries to export');
      return;
    }

    const excelData = filteredEntries.map(entry => ({
      'Timestamp': entry.timestamp,
      'User': entry.user,
      'Action': entry.action,
      'Object': entry.object,
      'Site': entry.site,
      'Technology': entry.technology,
      'Vendor': entry.vendor,
      'Status': entry.status,
      'Change Details': entry.changeDetails,
      'Reversible': entry.reversible ? 'Yes' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Log');

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

    // Set column widths
    const colWidths = Array(10).fill({ wch: 18 });
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `audit_log_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  React.useEffect(() => {
    if (!selectedSnapshotId || selectedMode !== 'targeted') return;
    console.log('[Rollback] Preview rows recalculated:', {
      snapshotId: selectedSnapshotId,
      rows: comparisonRows.length,
      selectedObjects: selectedObjectList.length,
      selectedParameters: selectedParameterList.length
    });
    setPreviewModel((prev) =>
      prev.snapshotId !== selectedSnapshotId
        ? prev
        : {
            ...prev,
            objectIds: selectedObjectList,
            parameters: selectedParameterList,
            rows: comparisonRows
          }
    );
  }, [selectedSnapshotId, selectedMode, comparisonRows, selectedObjectList, selectedParameterList]);

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      {/* ROLLBACK SECTION */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">Rollback Management</h2>
          <p className="text-sm text-muted-foreground mt-2">Restore configurations using Full or Targeted rollback with object/parameter-level control</p>
        </div>

        {/* Rollback Strategy Selection */}
        <div className="bg-card border border-border rounded-lg p-4 mb-2">
          <h3 className="font-semibold text-foreground mb-4">Select Rollback Strategy</h3>
          <div className="grid grid-cols-2 gap-3">
            {['full', 'targeted'].map(mode => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode as any)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedMode === mode
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                }`}
              >
                <p className="font-semibold text-sm capitalize">{mode} Rollback</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {mode === 'full' && 'Restore all objects to previous state'}
                  {mode === 'targeted' && 'Choose specific objects and parameters to rollback'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Change Snapshots */}
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-3">Available Snapshots ({snapshots.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max max-h-[34rem] overflow-y-auto pr-1">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className={cn(
                  "border rounded-xl overflow-hidden bg-card transition",
                  selectedSnapshotId === snapshot.id
                    ? "border-primary ring-2 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <label
                      className={cn(
                        "inline-flex items-center gap-3 rounded-lg px-3 py-2 border text-sm font-semibold min-h-11 cursor-pointer",
                        snapshot.status === 'active'
                          ? "border-border hover:border-primary/50"
                          : "border-border/60 opacity-70 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="radio"
                        name="selected-snapshot"
                        className="sr-only"
                        checked={selectedSnapshotId === snapshot.id}
                        onChange={() => {
                          handleSnapshotSelect(snapshot);
                        }}
                        disabled={snapshot.status !== 'active'}
                      />
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          selectedSnapshotId === snapshot.id ? "border-primary" : "border-muted-foreground"
                        )}
                      >
                        {selectedSnapshotId === snapshot.id && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </span>
                      Select
                    </label>
                    <span className={`text-xs px-2.5 py-1 rounded font-semibold whitespace-nowrap ${
                      snapshot.status === 'active'
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {snapshot.status === 'active' ? '● Active' : '○ Rolled back'}
                    </span>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-foreground">{snapshot.scriptUsed}</p>
                    <p className="text-xs text-muted-foreground mt-1">{snapshot.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
                      <p className="font-medium text-foreground mt-0.5">{snapshot.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Engineer</p>
                      <p className="font-medium text-foreground mt-0.5">{snapshot.user}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Object Count</p>
                      <p className="font-medium text-foreground mt-0.5">{getSafeObjectIds(snapshot).length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Parameter Change Count</p>
                      <p className="font-medium text-foreground mt-0.5">{buildDiffRows(snapshot).length}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(expandedId === snapshot.id ? null : snapshot.id)}
                    className="w-full text-left text-sm font-semibold text-primary hover:text-primary/80 border border-border rounded-lg px-3 py-2"
                  >
                    {expandedId === snapshot.id ? 'Hide Changes' : 'View Changes'}
                  </button>
                </div>

                {expandedId === snapshot.id && (
                  <div className="px-5 pb-5">
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left border-b border-border">
                            <th className="p-2.5">Object</th>
                            <th className="p-2.5">Parameter</th>
                            <th className="p-2.5">Current value</th>
                            <th className="p-2.5">Previous value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {buildDiffRows(snapshot).map((row) => (
                            <tr key={`${snapshot.id}-${row.objectId}-${row.parameter}`} className="border-b border-border/40 last:border-0">
                              <td className="p-2.5">{row.objectId}</td>
                              <td className="p-2.5">{row.parameter}</td>
                              <td className="p-2.5 font-mono">{row.currentValue}</td>
                              <td className="p-2.5 font-mono">{row.previousValue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
          ))}
          </div>
        </div>

        {selectedMode === 'targeted' && selectedSnapshot && previewModel.snapshotId === selectedSnapshot.id && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Targeted Rollback Selection</h3>
            <div>
              <p className="font-semibold text-foreground text-sm mb-3">Select Objects to Rollback</p>
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded border border-border">
                {getSafeObjectIds(selectedSnapshot).map(obj => (
                  <label key={obj} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={selectedObjects.has(obj)}
                      onChange={() => toggleObject(obj)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">{obj}</span>
                  </label>
                ))}
                {getSafeObjectIds(selectedSnapshot).length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">No rollbackable objects found in selected snapshot.</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-3">Select Parameters to Rollback</p>
              <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded border border-border">
                {PARAMETER_OPTIONS.map(param => (
                  <label key={param} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={selectedParameters.has(param)}
                      onChange={() => toggleParameter(param)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">{param}</span>
                  </label>
                ))}
                {PARAMETER_OPTIONS.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">No rollbackable parameters found in selected snapshot.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedSnapshot && selectedMode === 'targeted' && previewModel.snapshotId === selectedSnapshot.id && previewModel.rows.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Configuration Comparison (Current vs Previous)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-2">Object</th>
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Current value</th>
                    <th className="p-2">Previous value</th>
                  </tr>
                </thead>
                <tbody>
                  {previewModel.rows.map((row) => (
                    <tr key={`${row.objectId}-${row.parameter}`} className="border-b border-border/50">
                      <td className="p-2">{row.objectId}</td>
                      <td className="p-2">{row.parameter}</td>
                      <td className="p-2 font-mono">{row.currentValue}</td>
                      <td className="p-2 font-mono">{row.previousValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedSnapshot && selectedMode === 'targeted' && previewModel.snapshotId === selectedSnapshot.id && previewModel.rows.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground">Rollback Preview</h3>
            <p className="text-sm text-muted-foreground mt-2">
              No valid rollback targets could be derived from the selected snapshot. Select objects and parameters manually to proceed.
            </p>
          </div>
        )}

        {selectedSnapshotId && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Rollback Preview</h3>
            <p className="text-sm text-muted-foreground">
              Snapshot: <span className="font-semibold text-foreground">{selectedSnapshotId}</span> • Mode: <span className="font-semibold text-foreground capitalize">{selectedMode}</span>
            </p>
            {selectedMode === 'targeted' && (
              <p className="text-sm text-muted-foreground">
                Selected Objects: <span className="font-semibold text-foreground">{previewModel.objectIds.length}</span> • Selected Parameters: <span className="font-semibold text-foreground">{previewModel.parameters.length}</span> • Preview Rows: <span className="font-semibold text-foreground">{previewModel.rows.length}</span>
              </p>
            )}
            <button
              onClick={executeRollback}
              disabled={selectedMode === 'targeted' && (previewModel.objectIds.length === 0 || previewModel.parameters.length === 0 || previewModel.rows.length === 0 || executionComplete)}
              className="w-full px-4 py-2.5 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 font-semibold flex items-center justify-center gap-2 transition disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              {selectedMode === 'full'
                ? 'Execute Full Rollback'
                : `Execute Targeted Rollback (${previewModel.objectIds.length} object(s), ${previewModel.parameters.length} parameter(s))`}
            </button>
          </div>
        )}
      </div>

      {/* AUDIT SECTION */}
      <div className="border-t border-border pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
              <p className="text-sm text-muted-foreground mt-2">Complete audit trail of all changes with filtering and rollback capabilities</p>
            </div>
            {/* Export Menu */}
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 rounded-lg text-green-700 dark:text-green-400 font-semibold text-xs transition flex items-center gap-1 whitespace-nowrap"
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

          {/* Audit Filters */}
          <div className="grid grid-cols-3 gap-2">
            {/* Site Filter */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SearchableDropdown
                  label="Site"
                  options={SITE_OPTIONS}
                  selected={selectedSite}
                  onChange={setSelectedSite}
                  placeholder="All Sites"
                  multiSelect={false}
                  searchable={true}
                  compact={true}
                />
              </div>
              {selectedSite.length > 0 && (
                <button
                  onClick={() => setSelectedSite([])}
                  className="px-2.5 py-1.5 h-9 bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-md transition flex-shrink-0"
                  title="Clear site filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Technology Filter */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SearchableDropdown
                  label="Technology"
                  options={TECHNOLOGY_OPTIONS}
                  selected={selectedTechnology}
                  onChange={setSelectedTechnology}
                  placeholder="All Technologies"
                  multiSelect={false}
                  searchable={true}
                  compact={true}
                />
              </div>
              {selectedTechnology.length > 0 && (
                <button
                  onClick={() => setSelectedTechnology([])}
                  className="px-2.5 py-1.5 h-9 bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-md transition flex-shrink-0"
                  title="Clear technology filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Vendor Filter */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SearchableDropdown
                  label="Vendor"
                  options={VENDOR_OPTIONS}
                  selected={selectedVendor}
                  onChange={setSelectedVendor}
                  placeholder="All Vendors"
                  multiSelect={false}
                  searchable={true}
                  compact={true}
                />
              </div>
              {selectedVendor.length > 0 && (
                <button
                  onClick={() => setSelectedVendor([])}
                  className="px-2.5 py-1.5 h-9 bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-md transition flex-shrink-0"
                  title="Clear vendor filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Audit Log */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-64">
            {filteredEntries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No audit entries found matching your filters</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{entry.action}</p>
                    <p className="text-sm text-muted-foreground">{entry.object}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    entry.status === 'completed' ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' :
                    entry.status === 'failed' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                    'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {entry.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>{entry.timestamp} • {entry.user}</div>
                  {entry.reversible && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <RotateCcw className="w-3 h-3" />
                      Reversible
                    </div>
                  )}
                </div>

                {selectedEntry === entry.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Change Details</p>
                      <p className="text-sm font-mono text-foreground">{entry.changeDetails}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFullDetails(entry.id);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 font-semibold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Details
                      </button>
                      {entry.reversible && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAuditRollback(entry.id);
                          }}
                          className="flex-1 px-3 py-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900 font-semibold text-sm flex items-center justify-center gap-2 transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Rollback
                        </button>
                      )}
                    </div>

                    {/* Full Details View */}
                    {detailedViewId === entry.id && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Action</p>
                            <p className="text-sm font-mono text-foreground">{entry.action}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Object</p>
                            <p className="text-sm font-mono text-foreground">{entry.object}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Site</p>
                            <p className="text-sm font-mono text-foreground">{entry.site}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Technology</p>
                            <p className="text-sm font-mono text-foreground">{entry.technology}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Vendor</p>
                            <p className="text-sm font-mono text-foreground">{entry.vendor}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">User</p>
                            <p className="text-sm font-mono text-foreground">{entry.user}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Timestamp</p>
                            <p className="text-sm font-mono text-foreground">{entry.timestamp}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
                            <p className="text-sm font-mono text-foreground capitalize">{entry.status}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Change Details</p>
                          <p className="text-sm font-mono text-foreground bg-background p-2 rounded">{entry.changeDetails}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
