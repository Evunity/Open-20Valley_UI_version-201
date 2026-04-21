import React, { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import {
  Plus, Trash2, Save, ZoomIn, ZoomOut, Code, PanelLeftOpen, PanelLeftClose, PanelRightClose, PanelRightOpen, Maximize2, Minimize2, ScanLine
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Handle {
  id: string;
  type: 'input' | 'output';
  label: string;
}

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
  handles: Handle[];
}

interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandleId: string;
  targetHandleId: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'time' | 'datetime';
interface NodeFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  helper?: string;
  options?: string[];
  defaultValue?: any;
}
interface NodeLibraryItem {
  type: string;
  label: string;
  category: string;
  description: string;
  icon: string;
  bgLight: string;
  flow: 'trigger' | 'condition' | 'switch' | 'default' | 'terminal';
  fields: NodeFieldSchema[];
}

const KPI_OPTIONS = ['Availability', 'CSSR', 'DCR', 'HOSR', 'PRB_DL', 'PRB_UL', 'DL_Throughput', 'UL_Throughput', 'RRC_Users'];
const COMPARISON_OPTIONS = ['=', '!=', '>', '<', '>=', '<=', 'contains'];
const SCOPE_OPTIONS = ['site', 'cell', 'link', 'node'];
const SEVERITY_OPTIONS = ['critical', 'major', 'minor', 'warning', 'info'];

const NODE_LIBRARY: NodeLibraryItem[] = [
  { type: 'manual-trigger', label: 'Manual Trigger', category: 'Triggers', description: 'Run on-demand by an operator.', icon: '🖐️', bgLight: 'bg-blue-100 dark:bg-blue-950', flow: 'trigger', fields: [{ key: 'input_fields', label: 'Input Fields', type: 'textarea', helper: 'Optional JSON field list.' }, { key: 'allowed_roles', label: 'Allowed Roles', type: 'multiselect', options: ['admin', 'noc', 'engineer', 'viewer'] }] },
  { type: 'scheduled-trigger', label: 'Scheduled Trigger', category: 'Triggers', description: 'Run by schedule.', icon: '⏱️', bgLight: 'bg-blue-100 dark:bg-blue-950', flow: 'trigger', fields: [{ key: 'schedule_type', label: 'Schedule Type', type: 'select', options: ['once', 'daily', 'weekly', 'monthly'], defaultValue: 'daily' }, { key: 'run_time', label: 'Run Time', type: 'time' }, { key: 'timezone', label: 'Timezone', type: 'text', defaultValue: 'UTC' }, { key: 'days_of_week', label: 'Days of Week', type: 'multiselect', options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }, { key: 'day_of_month', label: 'Day of Month', type: 'number' }] },
  { type: 'kpi-threshold-trigger', label: 'KPI Threshold Trigger', category: 'Triggers', description: 'Trigger on KPI breach.', icon: '📈', bgLight: 'bg-blue-100 dark:bg-blue-950', flow: 'trigger', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'kpi_name', label: 'KPI Name', type: 'select', options: KPI_OPTIONS }, { key: 'comparison', label: 'Comparison', type: 'select', options: COMPARISON_OPTIONS }, { key: 'threshold_value', label: 'Threshold', type: 'number' }, { key: 'granularity', label: 'Granularity', type: 'select', options: ['5m', '15m', '1h', '1d'] }, { key: 'consecutive_intervals', label: 'Consecutive Intervals', type: 'number', defaultValue: 1 }] },
  { type: 'alarm-raised-trigger', label: 'Alarm Raised Trigger', category: 'Triggers', description: 'Trigger on alarm raised.', icon: '🚨', bgLight: 'bg-blue-100 dark:bg-blue-950', flow: 'trigger', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'alarm_codes', label: 'Alarm Codes', type: 'textarea' }, { key: 'severity', label: 'Severity', type: 'multiselect', options: SEVERITY_OPTIONS }, { key: 'source_type', label: 'Source Type', type: 'text' }] },
  { type: 'alarm-cleared-trigger', label: 'Alarm Cleared Trigger', category: 'Triggers', description: 'Trigger on alarm clear.', icon: '✅', bgLight: 'bg-blue-100 dark:bg-blue-950', flow: 'trigger', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'alarm_codes', label: 'Alarm Codes', type: 'textarea' }, { key: 'severity', label: 'Severity', type: 'multiselect', options: SEVERITY_OPTIONS }] },
  { type: 'if-condition', label: 'If Condition', category: 'Logic', description: 'Branch with expression.', icon: '❓', bgLight: 'bg-amber-100 dark:bg-amber-950', flow: 'condition', fields: [{ key: 'left_value', label: 'Left Value', type: 'text' }, { key: 'operator', label: 'Operator', type: 'select', options: COMPARISON_OPTIONS }, { key: 'right_value', label: 'Right Value', type: 'text' }] },
  { type: 'multi-condition', label: 'Multi Condition', category: 'Logic', description: 'Evaluate multiple conditions.', icon: '🧠', bgLight: 'bg-amber-100 dark:bg-amber-950', flow: 'condition', fields: [{ key: 'conditions', label: 'Conditions JSON', type: 'textarea' }, { key: 'logic_mode', label: 'Logic Mode', type: 'select', options: ['AND', 'OR'] }] },
  { type: 'switch', label: 'Switch', category: 'Logic', description: 'Route by field value.', icon: '🔀', bgLight: 'bg-amber-100 dark:bg-amber-950', flow: 'switch', fields: [{ key: 'field_name', label: 'Field Name', type: 'text' }, { key: 'cases', label: 'Cases JSON', type: 'textarea' }, { key: 'default_path', label: 'Default Path', type: 'text' }] },
  { type: 'wait-delay', label: 'Wait / Delay', category: 'Logic', description: 'Pause execution.', icon: '⏳', bgLight: 'bg-amber-100 dark:bg-amber-950', flow: 'default', fields: [{ key: 'wait_type', label: 'Wait Type', type: 'select', options: ['seconds', 'minutes', 'hours', 'until_time'] }, { key: 'duration', label: 'Duration', type: 'number' }, { key: 'until_time', label: 'Until Time', type: 'time' }] },
  { type: 'loop-over-list', label: 'Loop Over List', category: 'Logic', description: 'Iterate items.', icon: '🔁', bgLight: 'bg-amber-100 dark:bg-amber-950', flow: 'default', fields: [{ key: 'list_variable', label: 'List Variable', type: 'text' }, { key: 'max_parallel', label: 'Max Parallel', type: 'number', defaultValue: 1 }] },
  { type: 'stop-workflow', label: 'Stop Workflow', category: 'Logic', description: 'Terminate workflow.', icon: '🛑', bgLight: 'bg-amber-100 dark:bg-amber-950', flow: 'terminal', fields: [{ key: 'reason', label: 'Reason', type: 'textarea' }] },
  { type: 'set-variable', label: 'Set Variable', category: 'Utilities', description: 'Set runtime variable.', icon: '🧩', bgLight: 'bg-gray-100 dark:bg-gray-900', flow: 'default', fields: [{ key: 'variable_name', label: 'Variable Name', type: 'text' }, { key: 'value', label: 'Value', type: 'text' }] },
  { type: 'open-site', label: 'Open Site', category: 'Site / Object', description: 'Load site context.', icon: '🏗️', bgLight: 'bg-cyan-100 dark:bg-cyan-950', flow: 'default', fields: [{ key: 'site_id', label: 'Site ID', type: 'text' }] },
  { type: 'open-cell', label: 'Open Cell', category: 'Site / Object', description: 'Load cell context.', icon: '📶', bgLight: 'bg-cyan-100 dark:bg-cyan-950', flow: 'default', fields: [{ key: 'cell_id', label: 'Cell ID', type: 'text' }] },
  { type: 'get-site-cells', label: 'Get Site Cells', category: 'Site / Object', description: 'Fetch cells in site.', icon: '🗺️', bgLight: 'bg-cyan-100 dark:bg-cyan-950', flow: 'default', fields: [{ key: 'site_id', label: 'Site ID', type: 'text' }, { key: 'technology', label: 'Technology', type: 'select', options: ['2G', '3G', '4G', '5G'] }] },
  { type: 'get-site-info', label: 'Get Site Info', category: 'Site / Object', description: 'Fetch site details.', icon: 'ℹ️', bgLight: 'bg-cyan-100 dark:bg-cyan-950', flow: 'default', fields: [{ key: 'site_id', label: 'Site ID', type: 'text' }, { key: 'include_location', label: 'Include Location', type: 'checkbox', defaultValue: true }, { key: 'include_vendor', label: 'Include Vendor', type: 'checkbox' }, { key: 'include_technology', label: 'Include Technology', type: 'checkbox' }] },
  { type: 'get-object-status', label: 'Get Object Status', category: 'Site / Object', description: 'Read object status.', icon: '📍', bgLight: 'bg-cyan-100 dark:bg-cyan-950', flow: 'default', fields: [{ key: 'object_type', label: 'Object Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'object_id', label: 'Object ID', type: 'text' }] },
  { type: 'check-kpi-reading', label: 'Check KPI Reading', category: 'KPI', description: 'Read KPI current value.', icon: '📊', bgLight: 'bg-green-100 dark:bg-green-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: ['site', 'cell'] }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'kpi_name', label: 'KPI Name', type: 'select', options: KPI_OPTIONS }, { key: 'granularity', label: 'Granularity', type: 'select', options: ['5m', '15m', '1h'] }] },
  { type: 'get-kpi-values', label: 'Get KPI Values', category: 'KPI', description: 'Query KPI time series.', icon: '📉', bgLight: 'bg-green-100 dark:bg-green-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'kpi_names', label: 'KPI Names', type: 'multiselect', options: KPI_OPTIONS }, { key: 'start_time', label: 'Start Time', type: 'datetime' }, { key: 'end_time', label: 'End Time', type: 'datetime' }, { key: 'granularity', label: 'Granularity', type: 'select', options: ['5m', '15m', '1h'] }, { key: 'aggregation', label: 'Aggregation', type: 'select', options: ['avg', 'min', 'max', 'sum'] }] },
  { type: 'check-kpi-threshold', label: 'Check KPI Threshold', category: 'KPI', description: 'Evaluate KPI against threshold.', icon: '🎯', bgLight: 'bg-green-100 dark:bg-green-950', flow: 'condition', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'kpi_name', label: 'KPI Name', type: 'select', options: KPI_OPTIONS }, { key: 'comparison', label: 'Comparison', type: 'select', options: COMPARISON_OPTIONS }, { key: 'threshold_value', label: 'Threshold', type: 'number' }, { key: 'granularity', label: 'Granularity', type: 'select', options: ['5m', '15m', '1h'] }] },
  { type: 'get-top-worst-cells', label: 'Get Top Worst Cells', category: 'KPI', description: 'Find worst performers.', icon: '📛', bgLight: 'bg-green-100 dark:bg-green-950', flow: 'default', fields: [{ key: 'parent_scope_type', label: 'Parent Scope Type', type: 'select', options: ['region', 'cluster', 'site'] }, { key: 'parent_scope_ids', label: 'Parent Scope IDs', type: 'textarea' }, { key: 'kpi_name', label: 'KPI Name', type: 'select', options: KPI_OPTIONS }, { key: 'top_count', label: 'Top Count', type: 'number', defaultValue: 10 }, { key: 'sort_order', label: 'Sort Order', type: 'select', options: ['asc', 'desc'] }, { key: 'time_window', label: 'Time Window', type: 'select', options: ['15m', '1h', '24h'] }] },
  { type: 'compare-kpi-before-after', label: 'Compare KPI Before / After', category: 'KPI', description: 'Compare KPI windows.', icon: '⚖️', bgLight: 'bg-green-100 dark:bg-green-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'kpi_name', label: 'KPI Name', type: 'select', options: KPI_OPTIONS }, { key: 'before_window', label: 'Before Window', type: 'text' }, { key: 'after_window', label: 'After Window', type: 'text' }] },
  { type: 'check-active-alarms', label: 'Check Active Alarms', category: 'Alarms', description: 'Get active alarms.', icon: '🚨', bgLight: 'bg-red-100 dark:bg-red-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'severity', label: 'Severity', type: 'multiselect', options: SEVERITY_OPTIONS }, { key: 'alarm_codes', label: 'Alarm Codes', type: 'textarea' }, { key: 'source_type', label: 'Source Type', type: 'text' }] },
  { type: 'check-alarm-count', label: 'Check Alarm Count', category: 'Alarms', description: 'Count alarms.', icon: '🔢', bgLight: 'bg-red-100 dark:bg-red-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'severity', label: 'Severity', type: 'multiselect', options: SEVERITY_OPTIONS }, { key: 'alarm_codes', label: 'Alarm Codes', type: 'textarea' }] },
  { type: 'check-alarm-exists', label: 'Check Alarm Exists', category: 'Alarms', description: 'Verify alarm exists.', icon: '🔍', bgLight: 'bg-red-100 dark:bg-red-950', flow: 'condition', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'alarm_code', label: 'Alarm Code', type: 'text' }, { key: 'severity', label: 'Severity', type: 'select', options: SEVERITY_OPTIONS }] },
  { type: 'get-alarm-history', label: 'Get Alarm History', category: 'Alarms', description: 'Query alarm history.', icon: '🕘', bgLight: 'bg-red-100 dark:bg-red-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'start_time', label: 'Start Time', type: 'datetime' }, { key: 'end_time', label: 'End Time', type: 'datetime' }, { key: 'severity', label: 'Severity', type: 'multiselect', options: SEVERITY_OPTIONS }, { key: 'alarm_codes', label: 'Alarm Codes', type: 'textarea' }] },
  { type: 'acknowledge-alarm', label: 'Acknowledge Alarm', category: 'Alarms', description: 'Ack alarm IDs.', icon: '✍️', bgLight: 'bg-red-100 dark:bg-red-950', flow: 'default', fields: [{ key: 'alarm_ids', label: 'Alarm IDs', type: 'textarea' }, { key: 'comment', label: 'Comment', type: 'textarea' }] },
  { type: 'clear-alarm', label: 'Clear Alarm', category: 'Alarms', description: 'Clear alarm IDs.', icon: '🧹', bgLight: 'bg-red-100 dark:bg-red-950', flow: 'default', fields: [{ key: 'alarm_ids', label: 'Alarm IDs', type: 'textarea' }, { key: 'comment', label: 'Comment', type: 'textarea' }] },
  { type: 'execute-command', label: 'Execute Command', category: 'Actions / Command Center', description: 'Execute raw command.', icon: '⚡', bgLight: 'bg-purple-100 dark:bg-purple-950', flow: 'default', fields: [{ key: 'target_type', label: 'Target Type', type: 'select', options: ['site', 'node', 'cell'] }, { key: 'target_ids', label: 'Target IDs', type: 'textarea' }, { key: 'command_text', label: 'Command Text', type: 'textarea', helper: 'Use template node when possible for safety.' }, { key: 'protocol', label: 'Protocol', type: 'select', options: ['SSH', 'Telnet', 'API'] }, { key: 'timeout_seconds', label: 'Timeout (s)', type: 'number', defaultValue: 30 }] },
  { type: 'execute-command-template', label: 'Execute Command Template', category: 'Actions / Command Center', description: 'Safe templated command execution.', icon: '🧱', bgLight: 'bg-purple-100 dark:bg-purple-950', flow: 'default', fields: [{ key: 'target_type', label: 'Target Type', type: 'select', options: ['site', 'node', 'cell'] }, { key: 'target_ids', label: 'Target IDs', type: 'textarea' }, { key: 'command_template', label: 'Command Template', type: 'text' }, { key: 'template_variables', label: 'Template Variables', type: 'textarea' }, { key: 'timeout_seconds', label: 'Timeout (s)', type: 'number', defaultValue: 60 }] },
  { type: 'open-site-command-center', label: 'Open Site in Command Center', category: 'Actions / Command Center', description: 'Open site context.', icon: '🖥️', bgLight: 'bg-purple-100 dark:bg-purple-950', flow: 'default', fields: [{ key: 'site_id', label: 'Site ID', type: 'text' }] },
  { type: 'run-health-check', label: 'Run Health Check', category: 'Actions / Command Center', description: 'Run profile checks.', icon: '🩺', bgLight: 'bg-purple-100 dark:bg-purple-950', flow: 'default', fields: [{ key: 'target_type', label: 'Target Type', type: 'select', options: ['site', 'node', 'cell'] }, { key: 'target_ids', label: 'Target IDs', type: 'textarea' }, { key: 'check_profile', label: 'Check Profile', type: 'text' }] },
  { type: 'reset-cell', label: 'Reset Cell', category: 'Actions / Command Center', description: 'Reset selected cells.', icon: '🔄', bgLight: 'bg-purple-100 dark:bg-purple-950', flow: 'default', fields: [{ key: 'cell_ids', label: 'Cell IDs', type: 'textarea' }, { key: 'reset_type', label: 'Reset Type', type: 'select', options: ['soft', 'hard'] }] },
  { type: 'lock-site', label: 'Lock Site', category: 'Actions / Command Center', description: 'Lock site for changes.', icon: '🔒', bgLight: 'bg-purple-100 dark:bg-purple-950', flow: 'default', fields: [{ key: 'site_id', label: 'Site ID', type: 'text' }, { key: 'lock_duration_minutes', label: 'Lock Duration (m)', type: 'number' }] },
  { type: 'release-site-lock', label: 'Release Site Lock', category: 'Actions / Command Center', description: 'Release lock.', icon: '🔓', bgLight: 'bg-purple-100 dark:bg-purple-950', flow: 'default', fields: [{ key: 'site_id', label: 'Site ID', type: 'text' }] },
  { type: 'create-report', label: 'Create Report', category: 'Reports', description: 'Create unified report.', icon: '📝', bgLight: 'bg-indigo-100 dark:bg-indigo-950', flow: 'default', fields: [{ key: 'report_name', label: 'Report Name', type: 'text' }, { key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'time_range', label: 'Time Range', type: 'text' }, { key: 'report_type', label: 'Report Type', type: 'select', options: ['KPI', 'Alarm', 'Site Summary'] }, { key: 'format', label: 'Format', type: 'select', options: ['PDF', 'Excel', 'CSV'] }] },
  { type: 'create-kpi-report', label: 'Create KPI Report', category: 'Reports', description: 'Build KPI report.', icon: '📄', bgLight: 'bg-indigo-100 dark:bg-indigo-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'kpi_names', label: 'KPI Names', type: 'multiselect', options: KPI_OPTIONS }, { key: 'time_range', label: 'Time Range', type: 'text' }, { key: 'format', label: 'Format', type: 'select', options: ['PDF', 'Excel', 'CSV'] }] },
  { type: 'create-alarm-report', label: 'Create Alarm Report', category: 'Reports', description: 'Build alarm report.', icon: '📑', bgLight: 'bg-indigo-100 dark:bg-indigo-950', flow: 'default', fields: [{ key: 'scope_type', label: 'Scope Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'scope_ids', label: 'Scope IDs', type: 'textarea' }, { key: 'severity', label: 'Severity', type: 'multiselect', options: SEVERITY_OPTIONS }, { key: 'alarm_codes', label: 'Alarm Codes', type: 'textarea' }, { key: 'time_range', label: 'Time Range', type: 'text' }, { key: 'format', label: 'Format', type: 'select', options: ['PDF', 'Excel', 'CSV'] }] },
  { type: 'create-site-summary-report', label: 'Create Site Summary Report', category: 'Reports', description: 'Build site summary report.', icon: '📚', bgLight: 'bg-indigo-100 dark:bg-indigo-950', flow: 'default', fields: [{ key: 'site_id', label: 'Site ID', type: 'text' }, { key: 'time_range', label: 'Time Range', type: 'text' }, { key: 'include_kpis', label: 'Include KPIs', type: 'checkbox', defaultValue: true }, { key: 'include_alarms', label: 'Include Alarms', type: 'checkbox', defaultValue: true }, { key: 'format', label: 'Format', type: 'select', options: ['PDF', 'Excel', 'CSV'] }] },
  { type: 'export-data', label: 'Export Data', category: 'Reports', description: 'Export selected dataset.', icon: '📤', bgLight: 'bg-indigo-100 dark:bg-indigo-950', flow: 'default', fields: [{ key: 'dataset_type', label: 'Dataset Type', type: 'text' }, { key: 'filters', label: 'Filters', type: 'textarea' }, { key: 'columns', label: 'Columns', type: 'textarea' }, { key: 'format', label: 'Format', type: 'select', options: ['PDF', 'Excel', 'CSV'] }] },
  { type: 'send-email', label: 'Send Email', category: 'Notifications', description: 'Email recipients.', icon: '📧', bgLight: 'bg-pink-100 dark:bg-pink-950', flow: 'default', fields: [{ key: 'recipients', label: 'Recipients', type: 'textarea' }, { key: 'subject', label: 'Subject', type: 'text' }, { key: 'body_template', label: 'Body Template', type: 'textarea' }, { key: 'attachments', label: 'Attachments', type: 'textarea' }] },
  { type: 'send-sms', label: 'Send SMS', category: 'Notifications', description: 'SMS recipients.', icon: '📱', bgLight: 'bg-pink-100 dark:bg-pink-950', flow: 'default', fields: [{ key: 'recipients', label: 'Recipients', type: 'textarea' }, { key: 'message', label: 'Message', type: 'textarea' }] },
  { type: 'send-teams-slack-message', label: 'Send Teams / Slack Message', category: 'Notifications', description: 'Post collaboration message.', icon: '💬', bgLight: 'bg-pink-100 dark:bg-pink-950', flow: 'default', fields: [{ key: 'channel_type', label: 'Channel Type', type: 'select', options: ['Teams', 'Slack'] }, { key: 'channel_name', label: 'Channel Name', type: 'text' }, { key: 'message_template', label: 'Message Template', type: 'textarea' }, { key: 'mentions', label: 'Mentions', type: 'textarea' }] },
  { type: 'create-noc-popup', label: 'Create NOC Popup', category: 'Notifications', description: 'Push popup to NOC.', icon: '🪧', bgLight: 'bg-pink-100 dark:bg-pink-950', flow: 'default', fields: [{ key: 'severity', label: 'Severity', type: 'select', options: SEVERITY_OPTIONS }, { key: 'title', label: 'Title', type: 'text' }, { key: 'message', label: 'Message', type: 'textarea' }, { key: 'require_acknowledgement', label: 'Require Acknowledgement', type: 'checkbox', defaultValue: true }] },
  { type: 'create-ticket', label: 'Create Ticket', category: 'Tickets', description: 'Create incident ticket.', icon: '🎫', bgLight: 'bg-orange-100 dark:bg-orange-950', flow: 'default', fields: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'ticket_type', label: 'Ticket Type', type: 'text' }, { key: 'category', label: 'Category', type: 'text' }, { key: 'priority', label: 'Priority', type: 'select', options: ['P1', 'P2', 'P3', 'P4'] }, { key: 'impacted_object_type', label: 'Impacted Object Type', type: 'select', options: SCOPE_OPTIONS }, { key: 'impacted_object_ids', label: 'Impacted Object IDs', type: 'textarea' }, { key: 'assignment_group', label: 'Assignment Group', type: 'text' }] },
  { type: 'update-ticket', label: 'Update Ticket', category: 'Tickets', description: 'Update ticket fields.', icon: '🛠️', bgLight: 'bg-orange-100 dark:bg-orange-950', flow: 'default', fields: [{ key: 'ticket_id', label: 'Ticket ID', type: 'text' }, { key: 'fields_to_update', label: 'Fields To Update', type: 'textarea' }, { key: 'comment', label: 'Comment', type: 'textarea' }] },
  { type: 'change-ticket-status', label: 'Change Ticket Status', category: 'Tickets', description: 'Move ticket status.', icon: '📌', bgLight: 'bg-orange-100 dark:bg-orange-950', flow: 'default', fields: [{ key: 'ticket_id', label: 'Ticket ID', type: 'text' }, { key: 'new_status', label: 'New Status', type: 'text' }, { key: 'comment', label: 'Comment', type: 'textarea' }] },
  { type: 'transform-data', label: 'Transform Data', category: 'Utilities', description: 'Transform variable data.', icon: '🧮', bgLight: 'bg-gray-100 dark:bg-gray-900', flow: 'default', fields: [{ key: 'input_variable', label: 'Input Variable', type: 'text' }, { key: 'transform_type', label: 'Transform Type', type: 'select', options: ['filter', 'sort', 'map', 'limit'] }] },
  { type: 'get-current-time', label: 'Get Current Time', category: 'Utilities', description: 'Get current time.', icon: '🕒', bgLight: 'bg-gray-100 dark:bg-gray-900', flow: 'default', fields: [{ key: 'timezone', label: 'Timezone', type: 'text', defaultValue: 'UTC' }] },
  { type: 'format-message', label: 'Format Message', category: 'Utilities', description: 'Format template message.', icon: '✉️', bgLight: 'bg-gray-100 dark:bg-gray-900', flow: 'default', fields: [{ key: 'template_text', label: 'Template Text', type: 'textarea' }] }
];

const NODE_CATEGORIES = ['Triggers', 'Logic', 'Site / Object', 'KPI', 'Alarms', 'Actions / Command Center', 'Reports', 'Notifications', 'Tickets', 'Utilities'];
const NODE_MAP = Object.fromEntries(NODE_LIBRARY.map((item) => [item.type, item]));
const getNodeHandles = (nodeType: string): Handle[] => {
  const flow = NODE_MAP[nodeType]?.flow ?? 'default';
  if (flow === 'trigger') return [{ id: 'output_main', type: 'output', label: 'Start' }];
  if (flow === 'condition' || flow === 'switch') {
    return [
      { id: 'input_main', type: 'input', label: 'Input' },
      { id: 'output_true', type: 'output', label: 'True' },
      { id: 'output_false', type: 'output', label: 'False' }
    ];
  }
  if (flow === 'terminal') return [{ id: 'input_main', type: 'input', label: 'Input' }];
  return [{ id: 'input_main', type: 'input', label: 'Input' }, { id: 'output_main', type: 'output', label: 'Output' }];
};

export const WorkflowBuilder: React.FC<{
  onSave?: (workflow: Workflow) => void;
  onCancel?: () => void;
  initialWorkflow?: Workflow;
}> = ({
  onSave,
  onCancel,
  initialWorkflow
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasWorkspaceRef = useRef<HTMLDivElement>(null);
  const inputHandleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const outputHandleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [workflow, setWorkflow] = useState<Workflow>(() => initialWorkflow || ({
    id: `workflow_${Date.now()}`,
    name: 'New Workflow',
    description: '',
    nodes: [
      {
        id: 'node_1',
        type: 'manual-trigger',
        label: 'Manual Trigger',
        x: 100,
        y: 100,
        config: {},
        handles: getNodeHandles('manual-trigger')
      }
    ],
    edges: [],
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    active: false
  }));

  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_1');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingEdge, setDraggingEdge] = useState<{ fromNodeId: string; fromHandleId: string; x: number; y: number } | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [nodeSearch, setNodeSearch] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(200);
  const [rightPanelWidth, setRightPanelWidth] = useState(340);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resizePanel, setResizePanel] = useState<'left' | 'right' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [edgeGeometry, setEdgeGeometry] = useState<Record<string, { x1: number; y1: number; x2: number; y2: number }>>({});
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const panStartRef = useRef(panStart);
  const draggingNodeRef = useRef(draggingNode);
  const dragOffsetRef = useRef(dragOffset);
  const draggingEdgeRef = useRef(draggingEdge);
  const isPanningRef = useRef(isPanning);

  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panStartRef.current = panStart; }, [panStart]);
  useEffect(() => { draggingNodeRef.current = draggingNode; }, [draggingNode]);
  useEffect(() => { dragOffsetRef.current = dragOffset; }, [dragOffset]);
  useEffect(() => { draggingEdgeRef.current = draggingEdge; }, [draggingEdge]);
  useEffect(() => { isPanningRef.current = isPanning; }, [isPanning]);

  useEffect(() => {
    if (initialWorkflow) {
      setWorkflow(initialWorkflow);
      setSelectedNodeId(initialWorkflow.nodes[0]?.id || '');
      setSelectedEdgeId(null);
    }
  }, [initialWorkflow]);

  useEffect(() => {
    if (!selectedNodeId) {
      setShowRightPanel(false);
    }
  }, [selectedNodeId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === canvasWorkspaceRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!resizePanel) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();

      if (resizePanel === 'left') {
        const next = Math.min(320, Math.max(160, event.clientX - rect.left));
        setLeftPanelWidth(next);
      } else {
        const next = Math.min(480, Math.max(280, rect.right - event.clientX));
        setRightPanelWidth(next);
      }
    };

    const handleMouseUp = () => setResizePanel(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizePanel]);


  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;

  const getNodeBounds = useCallback(() => {
    if (workflow.nodes.length === 0) {
      return { minX: -500, minY: -500, maxX: 500, maxY: 500 };
    }

    const minX = Math.min(...workflow.nodes.map((n) => n.x)) - 200;
    const maxX = Math.max(...workflow.nodes.map((n) => n.x + 160)) + 200;
    const minY = Math.min(...workflow.nodes.map((n) => n.y)) - 200;
    const maxY = Math.max(...workflow.nodes.map((n) => n.y + 64)) + 200;
    return { minX, minY, maxX, maxY };
  }, [workflow.nodes]);

  const getSmoothEdgePath = (x1: number, y1: number, x2: number, y2: number) => {
    const delta = Math.abs(x2 - x1);
    const control = Math.max(36, Math.min(140, delta * 0.45));
    const c1x = x1 + control;
    const c2x = x2 - control;
    return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
  };

  const canConnectNodes = (sourceNodeId: string, sourceHandleId: string, targetNodeId: string, targetHandleId: string): boolean => {
    if (sourceNodeId === targetNodeId) return false;

    const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
    const targetNode = workflow.nodes.find(n => n.id === targetNodeId);
    if (!sourceNode || !targetNode) return false;

    const sourceHandle = sourceNode.handles.find(h => h.id === sourceHandleId);
    const targetHandle = targetNode.handles.find(h => h.id === targetHandleId);
    if (!sourceHandle || !targetHandle) return false;

    if (sourceHandle.type !== 'output' || targetHandle.type !== 'input') return false;

    const edgeExists = workflow.edges.some(
      e => e.sourceNodeId === sourceNodeId && e.targetNodeId === targetNodeId && 
           e.sourceHandleId === sourceHandleId && e.targetHandleId === targetHandleId
    );
    if (edgeExists) return false;

    if (NODE_MAP[targetNode.type]?.flow === 'trigger') return false;

    const checkCycle = (nodeId: string, targetId: string, visited = new Set<string>()): boolean => {
      if (nodeId === targetId) return true;
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);
      
      const predecessors = workflow.edges
        .filter(e => e.targetNodeId === nodeId)
        .map(e => e.sourceNodeId);
      
      return predecessors.some(pred => checkCycle(pred, targetId, visited));
    };

    if (checkCycle(targetNodeId, sourceNodeId)) return false;

    return true;
  };

  const handleConnectNodes = (sourceNodeId: string, sourceHandleId: string, targetNodeId: string, targetHandleId: string) => {
    if (!canConnectNodes(sourceNodeId, sourceHandleId, targetNodeId, targetHandleId)) return;

    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      sourceNodeId,
      targetNodeId,
      sourceHandleId,
      targetHandleId
    };

    setWorkflow(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
      updatedAt: new Date().toLocaleString()
    }));
  };

  const handleAddNode = (type: string) => {
    const nodeType = type as WorkflowNode['type'];
    const definition = NODE_MAP[nodeType];
    const defaultConfig: Record<string, any> = {};
    (definition?.fields || []).forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaultConfig[field.key] = field.defaultValue;
      }
    });
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      label: definition?.label || nodeType,
      x: 300,
      y: 200,
      config: defaultConfig,
      handles: getNodeHandles(nodeType)
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toLocaleString()
    }));
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.sourceNodeId !== id && e.targetNodeId !== id),
      updatedAt: new Date().toLocaleString()
    }));
    if (selectedNodeId === id) setSelectedNodeId(workflow.nodes[0]?.id || '');
  };

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    setShowRightPanel(true);
  }, []);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setIsPanning(false);
    handleSelectNode(nodeId);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const node = workflow.nodes.find((n) => n.id === nodeId);
      if (node) {
        const pointerX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
        const pointerY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;
        setDragOffset({
          x: pointerX - node.x,
          y: pointerY - node.y
        });
      }
    }
    setDraggingNode(nodeId);
  };

  const applyPointerMove = useCallback((clientX: number, clientY: number) => {
    if (isPanningRef.current) {
      setPan({
        x: clientX - panStartRef.current.x,
        y: clientY - panStartRef.current.y
      });
    }

    if (canvasRef.current && draggingNodeRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - panRef.current.x) / zoomRef.current;
      const y = (clientY - rect.top - panRef.current.y) / zoomRef.current;
      const { x: offsetX, y: offsetY } = dragOffsetRef.current;

      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNodeRef.current ? { ...n, x: x - offsetX, y: y - offsetY } : n
        ),
        updatedAt: new Date().toLocaleString()
      }));
    }

    if (draggingEdgeRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        setDraggingEdge(prev => prev ? { ...prev, x, y } : null);
      }
    }
  }, []);

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    applyPointerMove(e.clientX, e.clientY);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelectedNodeId('');
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (e.target === canvasRef.current) {
      setSelectedEdgeId(null);
    }
    setDraggingNode(null);
    setDragOffset({ x: 0, y: 0 });
    setDraggingEdge(null);
  };

  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent) => {
      if (!isPanningRef.current && !draggingNodeRef.current && !draggingEdgeRef.current) return;
      applyPointerMove(event.clientX, event.clientY);
    };

    const handleWindowMouseUp = () => {
      if (!isPanningRef.current && !draggingNodeRef.current && !draggingEdgeRef.current) return;
      setIsPanning(false);
      setDraggingNode(null);
      setDragOffset({ x: 0, y: 0 });
      setDraggingEdge(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [applyPointerMove]);

  const handleOutputHandleMouseDown = (nodeId: string, handleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const outputHandle = outputHandleRefs.current[`${nodeId}:${handleId}`];
    if (canvasRect && outputHandle) {
      const handleRect = outputHandle.getBoundingClientRect();
      setDraggingEdge({
        fromNodeId: nodeId,
        fromHandleId: handleId,
        x: handleRect.left + handleRect.width / 2 - canvasRect.left,
        y: handleRect.top + handleRect.height / 2 - canvasRect.top
      });
    }
  };

  const handleInputHandleMouseUp = (nodeId: string, handleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (draggingEdge) {
      handleConnectNodes(draggingEdge.fromNodeId, draggingEdge.fromHandleId, nodeId, handleId);
      setDraggingEdge(null);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    handleSelectNode(nodeId);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId),
      updatedAt: new Date().toLocaleString()
    }));
    setSelectedEdgeId(null);
  };

  const recalculateEdgeGeometry = useCallback(() => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const nextGeometry: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {};

    workflow.edges.forEach((edge) => {
      const sourceHandle = outputHandleRefs.current[`${edge.sourceNodeId}:${edge.sourceHandleId}`];
      const targetHandle = inputHandleRefs.current[`${edge.targetNodeId}:${edge.targetHandleId}`];
      if (!sourceHandle || !targetHandle) return;

      const sourceRect = sourceHandle.getBoundingClientRect();
      const targetRect = targetHandle.getBoundingClientRect();

      nextGeometry[edge.id] = {
        x1: sourceRect.left + sourceRect.width / 2 - canvasRect.left,
        y1: sourceRect.top + sourceRect.height / 2 - canvasRect.top,
        x2: targetRect.left + targetRect.width / 2 - canvasRect.left,
        y2: targetRect.top + targetRect.height / 2 - canvasRect.top
      };
    });

    setEdgeGeometry(nextGeometry);
  }, [workflow.edges]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(recalculateEdgeGeometry);
    return () => cancelAnimationFrame(frame);
  }, [workflow.nodes, workflow.edges, zoom, pan, recalculateEdgeGeometry]);

  useEffect(() => {
    const scheduleRecalc = () => requestAnimationFrame(recalculateEdgeGeometry);
    const canvasEl = canvasRef.current;
    const observer = new ResizeObserver(scheduleRecalc);
    const mutationObserver = new MutationObserver(scheduleRecalc);

    if (canvasEl) {
      observer.observe(canvasEl);
      mutationObserver.observe(canvasEl, { childList: true, subtree: true, attributes: true });
    }

    window.addEventListener('resize', scheduleRecalc);
    return () => {
      window.removeEventListener('resize', scheduleRecalc);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [recalculateEdgeGeometry]);

  const handleToggleFullscreen = async () => {
    if (!canvasWorkspaceRef.current) return;
    if (document.fullscreenElement === canvasWorkspaceRef.current) {
      await document.exitFullscreen();
      return;
    }
    await canvasWorkspaceRef.current.requestFullscreen();
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitToScreen = useCallback(() => {
    if (!canvasRef.current || workflow.nodes.length === 0) return;

    const padding = 80;
    const { minX, minY, maxX, maxY } = getNodeBounds();

    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = (rect.width - padding * 2) / Math.max(boundsWidth, 1);
    const scaleY = (rect.height - padding * 2) / Math.max(boundsHeight, 1);
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(scaleX, scaleY)));

    setZoom(nextZoom);
    setPan({
      x: rect.width / 2 - (minX + boundsWidth / 2) * nextZoom,
      y: rect.height / 2 - (minY + boundsHeight / 2) * nextZoom
    });
  }, [getNodeBounds, workflow.nodes.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditing = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if (isEditing) return;

      if ((event.key === '+' || event.key === '=') && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setZoom((z) => Math.min(z + 0.1, MAX_ZOOM));
      } else if (event.key === '-' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setZoom((z) => Math.max(z - 0.1, MIN_ZOOM));
      } else if (event.key === '0') {
        event.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        handleFitToScreen();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, y: prev.y + 40 }));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, y: prev.y - 40 }));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, x: prev.x + 40 }));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setPan((prev) => ({ ...prev, x: prev.x - 40 }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleFitToScreen]);


  const isValidWorkflow = (() => {
    if (!workflow.name.trim()) return false;
    if (workflow.nodes.length === 0) return false;
    
    const hasTrigger = workflow.nodes.some(n => NODE_MAP[n.type]?.flow === 'trigger');
    if (!hasTrigger) return false;
    
    if (workflow.nodes.length > 1) {
      const connectedNodes = new Set<string>();
      connectedNodes.add(workflow.nodes.find(n => NODE_MAP[n.type]?.flow === 'trigger')!.id);
      
      const traverse = (nodeId: string) => {
        const outgoing = workflow.edges.filter(e => e.sourceNodeId === nodeId);
        outgoing.forEach(edge => {
          if (!connectedNodes.has(edge.targetNodeId)) {
            connectedNodes.add(edge.targetNodeId);
            traverse(edge.targetNodeId);
          }
        });
      };
      
      traverse(workflow.nodes.find(n => NODE_MAP[n.type]?.flow === 'trigger')!.id);
      
      return workflow.nodes.every(n => connectedNodes.has(n.id));
    }
    
    return true;
  })();

  const renderNodeField = (node: WorkflowNode, field: NodeFieldSchema) => {
    const value = node.config?.[field.key] ?? '';
    const setValue = (nextValue: any) => {
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === node.id ? { ...n, config: { ...n.config, [field.key]: nextValue } } : n))
      }));
    };

    if (field.type === 'textarea') {
      return <textarea value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background" rows={3} />;
    }
    if (field.type === 'number') {
      return <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value || 0))} className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background" />;
    }
    if (field.type === 'select') {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background">
          <option value="">Select...</option>
          {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (field.type === 'multiselect') {
      const values = Array.isArray(value) ? value : [];
      return (
        <select multiple value={values} onChange={(e) => setValue(Array.from(e.target.selectedOptions).map((o) => o.value))} className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background min-h-20">
          {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (field.type === 'checkbox') {
      return <input type="checkbox" checked={Boolean(value)} onChange={(e) => setValue(e.target.checked)} className="h-4 w-4" />;
    }
    if (field.type === 'time' || field.type === 'datetime') {
      return <input type={field.type === 'time' ? 'time' : 'datetime-local'} value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background" />;
    }

    return <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background" />;
  };

  return (
    <div ref={workspaceRef} className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div>
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Workflow name..."
              className="text-lg font-bold px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">{workflow.nodes.length} nodes • {workflow.edges.length} connections</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.1, MAX_ZOOM))}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.1, MIN_ZOOM))}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="px-2 py-1.5 text-xs hover:bg-muted rounded-lg transition"
            title="Fit to screen"
          >
            <ScanLine className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleResetView}
            className="px-2 py-1.5 text-xs font-semibold hover:bg-muted rounded-lg transition text-muted-foreground"
            title="Reset to 100%"
          >
            100%
          </button>
          <div className="text-xs text-muted-foreground px-2">{Math.round(zoom * 100)}%</div>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 hover:bg-muted rounded-lg transition"
            title={isFullscreen ? 'Exit fullscreen' : 'Maximize canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 hover:bg-muted rounded-lg transition"
            title="View JSON"
          >
            <Code className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={canvasWorkspaceRef} className={cn("flex flex-1 overflow-hidden p-1 gap-1 relative", isFullscreen && "p-0 gap-0 bg-background")}>
        {/* Left Sidebar - Node Palette */}
        {!isFullscreen && showNodePalette && (
          <>
            <div
              className="border border-border rounded-lg bg-card flex flex-col overflow-hidden shrink-0"
              style={{ width: leftPanelWidth }}
            >
              <div className="p-2 border-b border-border flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-foreground">Add Node</p>
                <button
                  onClick={() => setShowNodePalette(false)}
                  className="p-1.5 rounded hover:bg-muted"
                  title="Collapse add node panel"
                >
                  <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="px-2 pb-2">
                <input
                  value={nodeSearch}
                  onChange={(e) => setNodeSearch(e.target.value)}
                  placeholder="Search nodes..."
                  className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background"
                />
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3">
                {NODE_CATEGORIES.map((category) => {
                  const items = NODE_LIBRARY.filter((node) =>
                    node.category === category &&
                    `${node.label} ${node.description}`.toLowerCase().includes(nodeSearch.toLowerCase())
                  );
                  if (items.length === 0) return null;
                  return (
                    <div key={category}>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{category}</p>
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <button
                            key={item.type}
                            onClick={() => handleAddNode(item.type)}
                            className={cn('w-full p-2 rounded border border-border transition text-left hover:shadow-sm', item.bgLight)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{item.icon}</span>
                              <div>
                                <p className="text-[11px] font-bold text-foreground">{item.label}</p>
                                <p className="text-[10px] text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className="w-1 rounded bg-border/70 hover:bg-primary/50 cursor-col-resize"
              onMouseDown={() => setResizePanel('left')}
              title="Resize add node panel"
            />
          </>
        )}

        {!isFullscreen && !showNodePalette && (
          <button
            onClick={() => setShowNodePalette(true)}
            className="self-start mt-1 w-9 h-9 border border-border rounded-md bg-card hover:bg-muted transition shrink-0 flex items-center justify-center"
            title="Expand add node panel"
          >
            <PanelLeftOpen className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Canvas */}
        <div className="flex-1 min-w-0 flex flex-col bg-background overflow-hidden relative rounded-sm">
          <div
            ref={canvasRef}
            className={cn(
              'flex-1 overflow-hidden relative select-none',
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            )}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{
              backgroundImage: `
                linear-gradient(rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          >
            {!showNodePalette && (
              <button
                onClick={() => setShowNodePalette(true)}
                className="absolute top-2 left-2 z-30 w-8 h-8 rounded bg-card/90 border border-border hover:bg-muted flex items-center justify-center"
                title="Open add node panel"
              >
                <Plus className="w-4 h-4 text-foreground" />
              </button>
            )}

            {selectedNode && !showRightPanel && (
              <button
                onClick={() => setShowRightPanel(true)}
                className="absolute top-2 right-2 z-30 w-8 h-8 rounded bg-card/90 border border-border hover:bg-muted flex items-center justify-center"
                title="Open properties panel"
              >
                <PanelRightOpen className="w-4 h-4 text-foreground" />
              </button>
            )}

            {/* SVG Connections */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'auto' }}
            >
              <defs>
                <marker
                  id="workflow-edge-arrow"
                  viewBox="0 0 10 10"
                  markerWidth="8"
                  markerHeight="8"
                  refX="10"
                  refY="5"
                  orient="auto-start-reverse"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
                </marker>
                <marker
                  id="workflow-edge-arrow-selected"
                  viewBox="0 0 10 10"
                  markerWidth="8"
                  markerHeight="8"
                  refX="10"
                  refY="5"
                  orient="auto-start-reverse"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                </marker>
              </defs>

              {/* Edges */}
              {workflow.edges.map(edge => {
                const geometry = edgeGeometry[edge.id];
                if (!geometry) return null;
                const { x1, y1, x2, y2 } = geometry;

                const isSelected = selectedEdgeId === edge.id;

                const pathData = getSmoothEdgePath(x1, y1, x2, y2);

                // Calculate midpoint for delete button
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                return (
                  <g key={edge.id} onClick={() => { setSelectedEdgeId(edge.id); setSelectedNodeId(''); }} style={{ cursor: 'pointer' }}>
                    {/* Invisible wider path for better click area */}
                    <path
                      d={pathData}
                      stroke="transparent"
                      strokeWidth="12"
                      fill="none"
                      pointerEvents="auto"
                    />
                    {/* Visible edge */}
                    <path
                      d={pathData}
                      stroke={isSelected ? '#EF4444' : '#3B82F6'}
                      strokeWidth={isSelected ? 3 : 2}
                      fill="none"
                      strokeLinecap="round"
                      markerEnd={isSelected ? "url(#workflow-edge-arrow-selected)" : "url(#workflow-edge-arrow)"}
                      pointerEvents="none"
                    />
                    {/* Delete button on edge */}
                    {isSelected && (
                      <g>
                        {/* Background circle for delete button */}
                        <circle
                          cx={midX}
                          cy={midY}
                          r="12"
                          fill="#EF4444"
                          opacity="0.9"
                          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEdge(edge.id);
                          }}
                        />
                        {/* X icon */}
                        <text
                          x={midX}
                          y={midY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="16"
                          fontWeight="bold"
                          style={{ cursor: 'pointer', pointerEvents: 'none', userSelect: 'none' }}
                        >
                          ✕
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Dragging edge preview */}
              {draggingEdge && (() => {
                const outputHandle = outputHandleRefs.current[`${draggingEdge.fromNodeId}:${draggingEdge.fromHandleId}`];
                const canvasRect = canvasRef.current?.getBoundingClientRect();
                if (!outputHandle || !canvasRect) return null;
                const sourceRect = outputHandle.getBoundingClientRect();

                const x1 = sourceRect.left + sourceRect.width / 2 - canvasRect.left;
                const y1 = sourceRect.top + sourceRect.height / 2 - canvasRect.top;
                const x2 = draggingEdge.x;
                const y2 = draggingEdge.y;

                const pathData = getSmoothEdgePath(x1, y1, x2, y2);

                return (
                  <path
                    d={pathData}
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                );
              })()}
            </svg>

            {/* Nodes Container */}
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} className="absolute inset-0">
              {workflow.nodes.map(node => {
                const typeConfig = NODE_MAP[node.type] || {
                  icon: '🧩',
                  bgLight: 'bg-muted',
                  label: node.label
                };
                return (
                  <div
                    key={node.id}
                    style={{ left: node.x, top: node.y }}
                    className="absolute w-40 h-16 pointer-events-auto relative"
                  >
                    {/* Input Handles (left side) */}
                    {node.handles.filter(h => h.type === 'input').map((handle, idx) => {
                      const inputHandles = node.handles.filter(h => h.type === 'input');
                      const spacing = 64 / (inputHandles.length + 1);
                      const top = spacing * (idx + 1);
                      return (
                        <button
                          key={handle.id}
                          onMouseUp={(e) => handleInputHandleMouseUp(node.id, handle.id, e)}
                          ref={(el) => {
                            inputHandleRefs.current[`${node.id}:${handle.id}`] = el;
                          }}
                          className="absolute rounded-full bg-blue-500 hover:bg-blue-400 border-3 border-white hover:border-blue-200 shadow-lg transition hover:scale-150 cursor-crosshair"
                          style={{
                            width: '12px',
                            height: '12px',
                            left: '-14px',
                            top: `${top - 8}px`,
                            zIndex: 20
                          }}
                          title={`Input: ${handle.label}`}
                        />
                      );
                    })}

                    {/* Node */}
                    <div
                      onClick={() => handleNodeClick(node.id)}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      className={cn(
                        'w-full h-full rounded-lg border-2 flex flex-col items-center justify-center cursor-move transition relative',
                        `${typeConfig.bgLight} border-2`,
                        selectedNodeId === node.id ? 'border-primary shadow-lg' : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                      )}
                    >
                      <div className="text-2xl">{typeConfig.icon}</div>
                      <div className="text-xs font-bold text-center mt-0.5 text-foreground">
                        {node.label}
                      </div>
                    </div>

                    {/* Output Handles (right side) */}
                    {node.handles.filter(h => h.type === 'output').map((handle, idx) => {
                      const outputHandles = node.handles.filter(h => h.type === 'output');
                      const spacing = 64 / (outputHandles.length + 1);
                      const top = spacing * (idx + 1);
                      return (
                        <button
                          key={handle.id}
                          onMouseDown={(e) => handleOutputHandleMouseDown(node.id, handle.id, e)}
                          ref={(el) => {
                            outputHandleRefs.current[`${node.id}:${handle.id}`] = el;
                          }}
                          className="absolute rounded-full bg-green-500 hover:bg-green-400 border-3 border-white hover:border-green-200 shadow-lg transition hover:scale-150 cursor-crosshair"
                          style={{
                            width: '12px',
                            height: '12px',
                            right: '-14px',
                            top: `${top - 8}px`,
                            zIndex: 20
                          }}
                          title={`Output: ${handle.label} - Drag to connect`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {isFullscreen && showNodePalette && (
              <div className="absolute left-2 top-2 bottom-2 z-40 border border-border rounded-md bg-card/95 backdrop-blur-sm overflow-hidden" style={{ width: leftPanelWidth }}>
                <div className="p-2 border-b border-border flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-foreground">Add Node</p>
                  <button onClick={() => setShowNodePalette(false)} className="p-1 rounded hover:bg-muted" title="Collapse add node panel">
                    <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="px-2 pb-2">
                  <input
                    value={nodeSearch}
                    onChange={(e) => setNodeSearch(e.target.value)}
                    placeholder="Search nodes..."
                    className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background"
                  />
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3">
                  {NODE_CATEGORIES.map((category) => {
                    const items = NODE_LIBRARY.filter((node) =>
                      node.category === category &&
                      `${node.label} ${node.description}`.toLowerCase().includes(nodeSearch.toLowerCase())
                    );
                    if (items.length === 0) return null;
                    return (
                      <div key={category}>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{category}</p>
                        <div className="space-y-1.5">
                          {items.map((item) => (
                            <button
                              key={item.type}
                              onClick={() => handleAddNode(item.type)}
                              className={cn('w-full p-2 rounded border border-border transition text-left hover:shadow-sm', item.bgLight)}
                            >
                              <div className="flex items-center gap-2">
                                <span>{item.icon}</span>
                                <div>
                                  <p className="text-[11px] font-bold text-foreground">{item.label}</p>
                                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Node Config */}
        {selectedNode && showRightPanel && !isFullscreen && (
          <>
          <div
            className="w-1.5 rounded bg-border/70 hover:bg-primary/50 cursor-col-resize"
            onMouseDown={() => setResizePanel('right')}
            title="Resize properties panel"
          />
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 overflow-y-auto h-full shrink-0" style={{ width: rightPanelWidth }}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="text-2xl">{NODE_MAP[selectedNode.type]?.icon || '🧩'}</span>
                  {selectedNode.label}
                </p>
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="p-1.5 rounded hover:bg-muted"
                  title="Collapse properties panel"
                >
                  <PanelRightClose className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Node Properties */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Node Label</label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, label: e.target.value } : n) }))}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background"
                  />
                </div>
                {(NODE_MAP[selectedNode.type]?.fields || []).map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-foreground block mb-1">{field.label}</label>
                    {renderNodeField(selectedNode, field)}
                    {field.helper && <p className="text-[10px] text-muted-foreground mt-1">{field.helper}</p>}
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-bold text-foreground mb-2">Position</p>
                <p className="text-xs text-muted-foreground">
                  X: {Math.round(selectedNode.x)} • Y: {Math.round(selectedNode.y)}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteNode(selectedNodeId)}
                className="w-full mt-4 px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete Node
              </button>
            </div>
          </div>
          </>
        )}

        {selectedNode && showRightPanel && isFullscreen && (
          <div className="absolute right-2 top-2 bottom-2 z-40 bg-card/95 border border-border rounded-md p-3 overflow-y-auto" style={{ width: rightPanelWidth }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">{NODE_MAP[selectedNode.type]?.icon || '🧩'}</span>
                {selectedNode.label}
              </p>
              <button
                onClick={() => setShowRightPanel(false)}
                className="p-1.5 rounded hover:bg-muted"
                title="Collapse properties panel"
              >
                <PanelRightClose className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Node Label</label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => {
                    setWorkflow(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n =>
                        n.id === selectedNodeId ? { ...n, label: e.target.value } : n
                      )
                    }));
                  }}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {(NODE_MAP[selectedNode.type]?.fields || []).map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-foreground block mb-1">{field.label}</label>
                  {renderNodeField(selectedNode, field)}
                  {field.helper && <p className="text-[10px] text-muted-foreground mt-1">{field.helper}</p>}
                </div>
              ))}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">X: {Math.round(selectedNode.x)} • Y: {Math.round(selectedNode.y)}</p>
              </div>
              <button
                onClick={() => handleDeleteNode(selectedNodeId)}
                className="w-full mt-2 px-3 py-2 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete Node
              </button>
            </div>
          </div>
        )}

      </div>

      {/* JSON Preview */}
      {showPreview && (
        <div className="border-t border-border bg-card p-4 max-h-40 overflow-y-auto">
          <p className="text-xs font-bold text-foreground mb-2">Workflow JSON</p>
          <pre className="text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(workflow, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-border text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isValidWorkflow) {
                onSave?.(workflow);
              } else {
                const errors = [];
                if (!workflow.name.trim()) errors.push('• Workflow name is required');
                if (workflow.nodes.length === 0) errors.push('• Add at least one node');
                if (!workflow.nodes.some(n => NODE_MAP[n.type]?.flow === 'trigger')) errors.push('• Must have a trigger node');
                if (workflow.nodes.length > 1) {
                  const triggerNode = workflow.nodes.find(n => NODE_MAP[n.type]?.flow === 'trigger');
                  if (triggerNode) {
                    const connectedNodes = new Set<string>([triggerNode.id]);
                    const traverse = (nodeId: string) => {
                      const outgoing = workflow.edges.filter(e => e.sourceNodeId === nodeId);
                      outgoing.forEach(edge => {
                        if (!connectedNodes.has(edge.targetNodeId)) {
                          connectedNodes.add(edge.targetNodeId);
                          traverse(edge.targetNodeId);
                        }
                      });
                    };
                    traverse(triggerNode.id);
                    const unconnected = workflow.nodes.filter(n => !connectedNodes.has(n.id));
                    if (unconnected.length > 0) {
                      errors.push(`• ${unconnected.length} node(s) not connected to workflow`);
                    }
                  }
                }
                alert('Cannot save workflow:\n\n' + errors.join('\n'));
              }
            }}
            disabled={!isValidWorkflow}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2',
              isValidWorkflow
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Save className="w-3 h-3" /> Save Workflow
          </button>
        </div>
      </div>
    </div>
  );
};
