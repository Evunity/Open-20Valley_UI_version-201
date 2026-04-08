import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogStatus = 'success' | 'failed' | 'warning';
type ActionType =
  | 'View'
  | 'Update'
  | 'Create'
  | 'Export'
  | 'Alarm'
  | 'Auth'
  | 'Filter';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  role: string;
  actionLabel: string;
  actionType: ActionType;
  module: string;
  route: string;
  target: string;
  targetId: string;
  status: LogStatus;
  tenant: string;
  sessionId: string;
  ipAddress: string;
  deviceBrowser: string;
  previousValue?: string;
  newValue?: string;
  details: string;
}

const ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'evt_1001',
    timestamp: '2026-04-08T09:42:11Z',
    user: 'Alaa Hassan',
    email: 'alaa.hassan@ovscale.com',
    role: 'NOC Engineer',
    actionLabel: 'Opened Alarm Details',
    actionType: 'View',
    module: 'Alarm Management',
    route: '/alarms/details/ALM-77431',
    target: 'Alarm ALM-77431',
    targetId: 'ALM-77431',
    status: 'success',
    tenant: 'Egypt-North',
    sessionId: 'sess_8f0a9d31',
    ipAddress: '10.20.44.18',
    deviceBrowser: 'Windows 11 / Chrome 133',
    details: 'User opened alarm investigation panel and expanded RCA timeline for site Cairo-Site-2.'
  },
  {
    id: 'evt_1002',
    timestamp: '2026-04-08T09:38:40Z',
    user: 'Reem Khaled',
    email: 'reem.khaled@ovscale.com',
    role: 'RF Optimization Lead',
    actionLabel: 'Updated VLAN ID',
    actionType: 'Update',
    module: 'Rollback Management',
    route: '/command-center?tab=rollback',
    target: 'Cairo-Site-2',
    targetId: 'CELL-CAI2-L18',
    status: 'success',
    tenant: 'Egypt-North',
    sessionId: 'sess_cb3119af',
    ipAddress: '10.20.40.72',
    deviceBrowser: 'macOS / Safari 18',
    previousValue: 'VLAN ID: 111',
    newValue: 'VLAN ID: 101',
    details: 'Targeted rollback operation reverted VLAN ID only for Cairo-Site-2 after misconfiguration alert.'
  },
  {
    id: 'evt_1003',
    timestamp: '2026-04-08T09:31:02Z',
    user: 'Mona Adel',
    email: 'mona.adel@ovscale.com',
    role: 'Operations Manager',
    actionLabel: 'Exported KPI Report',
    actionType: 'Export',
    module: 'Reports',
    route: '/reports/modules/kpi',
    target: 'KPI Availability Daily Report',
    targetId: 'RPT-KPI-221',
    status: 'success',
    tenant: 'Group-Operations',
    sessionId: 'sess_4bc9d18f',
    ipAddress: '10.10.1.55',
    deviceBrowser: 'Windows 10 / Edge 132',
    details: 'Generated and exported KPI report in CSV for daily executive briefing.'
  },
  {
    id: 'evt_1004',
    timestamp: '2026-04-08T09:22:19Z',
    user: 'Karim Youssef',
    email: 'karim.youssef@ovscale.com',
    role: 'Topology Admin',
    actionLabel: 'Created Layer',
    actionType: 'Create',
    module: 'Topology Management',
    route: '/topology-management/layers',
    target: 'Transport-Core-Layer',
    targetId: 'LYR-0901',
    status: 'success',
    tenant: 'Egypt-North',
    sessionId: 'sess_5dc0ca4e',
    ipAddress: '10.20.41.12',
    deviceBrowser: 'Ubuntu / Firefox 127',
    details: 'Created new topology layer and linked 24 aggregation nodes for transport planning.'
  },
  {
    id: 'evt_1005',
    timestamp: '2026-04-08T09:18:06Z',
    user: 'Nour Samir',
    email: 'nour.samir@ovscale.com',
    role: 'NOC Engineer',
    actionLabel: 'Acknowledged Alarm',
    actionType: 'Alarm',
    module: 'Alarm Management',
    route: '/alarms',
    target: 'Alarm ALM-77412',
    targetId: 'ALM-77412',
    status: 'success',
    tenant: 'Egypt-South',
    sessionId: 'sess_67331dd0',
    ipAddress: '10.20.51.99',
    deviceBrowser: 'Windows 11 / Chrome 133',
    details: 'Acknowledged critical alarm and assigned incident INC-1922 for remediation workflow.'
  },
  {
    id: 'evt_1006',
    timestamp: '2026-04-08T09:11:42Z',
    user: 'Omar Fathy',
    email: 'omar.fathy@ovscale.com',
    role: 'Transport Analyst',
    actionLabel: 'Viewed Geospatial Map',
    actionType: 'View',
    module: 'Network Status',
    route: '/network-status?map=geospatial',
    target: 'Alexandria Region Heatmap',
    targetId: 'MAP-AX-08',
    status: 'success',
    tenant: 'Egypt-West',
    sessionId: 'sess_0a94b7d2',
    ipAddress: '10.20.60.17',
    deviceBrowser: 'macOS / Chrome 133',
    details: 'Opened geospatial map with outage overlay and congestion layer for active incident review.'
  },
  {
    id: 'evt_1007',
    timestamp: '2026-04-08T09:07:29Z',
    user: 'Alaa Hassan',
    email: 'alaa.hassan@ovscale.com',
    role: 'NOC Engineer',
    actionLabel: 'Changed Filters',
    actionType: 'Filter',
    module: 'Alarm Management',
    route: '/alarms?severity=critical&vendor=huawei',
    target: 'Alarm List Filters',
    targetId: 'FLT-ALM-09',
    status: 'warning',
    tenant: 'Egypt-North',
    sessionId: 'sess_8f0a9d31',
    ipAddress: '10.20.44.18',
    deviceBrowser: 'Windows 11 / Chrome 133',
    details: 'Applied combined filters (critical + Huawei). Query took longer than SLA threshold.'
  },
  {
    id: 'evt_1008',
    timestamp: '2026-04-08T08:59:16Z',
    user: 'Mona Adel',
    email: 'mona.adel@ovscale.com',
    role: 'Operations Manager',
    actionLabel: 'Logged In',
    actionType: 'Auth',
    module: 'Access Control',
    route: '/login',
    target: 'SSO Portal',
    targetId: 'AUTH-LOGIN',
    status: 'success',
    tenant: 'Group-Operations',
    sessionId: 'sess_4bc9d18f',
    ipAddress: '10.10.1.55',
    deviceBrowser: 'Windows 10 / Edge 132',
    details: 'User authenticated through SSO with MFA challenge.'
  },
  {
    id: 'evt_1009',
    timestamp: '2026-04-08T08:41:02Z',
    user: 'Guest User',
    email: 'external.audit@vendor.com',
    role: 'Read-Only Auditor',
    actionLabel: 'Opened Alarm Details',
    actionType: 'View',
    module: 'Alarm Management',
    route: '/alarms/details/ALM-77391',
    target: 'Alarm ALM-77391',
    targetId: 'ALM-77391',
    status: 'failed',
    tenant: 'Vendor-Access',
    sessionId: 'sess_1d0f95e6',
    ipAddress: '172.18.14.44',
    deviceBrowser: 'Windows 10 / Chrome 131',
    details: 'Access denied due to tenant scope restriction for protected alarm records.'
  },
  {
    id: 'evt_1010',
    timestamp: '2026-04-08T08:36:44Z',
    user: 'Nour Samir',
    email: 'nour.samir@ovscale.com',
    role: 'NOC Engineer',
    actionLabel: 'Logged Out',
    actionType: 'Auth',
    module: 'Access Control',
    route: '/logout',
    target: 'Session Termination',
    targetId: 'AUTH-LOGOUT',
    status: 'success',
    tenant: 'Egypt-South',
    sessionId: 'sess_4f2308aa',
    ipAddress: '10.20.51.99',
    deviceBrowser: 'Windows 11 / Chrome 133',
    details: 'User completed secure logout from command center.'
  }
];

const statusBadgeClass: Record<LogStatus, string> = {
  success: 'bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
  failed: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
};

const actionBadgeClass: Record<ActionType, string> = {
  View: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  Update: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
  Create: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30',
  Export: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  Alarm: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
  Auth: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30',
  Filter: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30'
};

const toInputDate = (iso: string) => iso.slice(0, 10);
const actionTypeBadgeLabel: Record<ActionType, string> = {
  View: 'VIEW',
  Update: 'EDIT',
  Create: 'CREATE',
  Export: 'EXPORT',
  Alarm: 'ACK',
  Auth: 'AUTH',
  Filter: 'FILTER'
};

export default function BehavioralAnalyticsLayer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState<'all' | ActionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | LogStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const users = useMemo(() => ['all', ...Array.from(new Set(ACTIVITY_LOGS.map((log) => log.user)))], []);
  const modules = useMemo(() => ['all', ...Array.from(new Set(ACTIVITY_LOGS.map((log) => log.module)))], []);

  const filteredLogs = useMemo(() => {
    return ACTIVITY_LOGS.filter((log) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [
          log.user,
          log.email,
          log.actionLabel,
          log.module,
          log.target,
          log.route,
          log.tenant,
          log.details
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesUser = userFilter === 'all' || log.user === userFilter;
      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
      const matchesActionType = actionTypeFilter === 'all' || log.actionType === actionTypeFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      const logDate = toInputDate(log.timestamp);
      const matchesDateFrom = !dateFrom || logDate >= dateFrom;
      const matchesDateTo = !dateTo || logDate <= dateTo;

      return (
        matchesSearch &&
        matchesUser &&
        matchesModule &&
        matchesActionType &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [actionTypeFilter, dateFrom, dateTo, moduleFilter, searchTerm, statusFilter, userFilter]);

  const totalEvents = filteredLogs.length;
  const activeUsers = new Set(filteredLogs.map((log) => log.user)).size;
  const failedActions = filteredLogs.filter((log) => log.status === 'failed').length;
  const mostAccessedModule =
    Object.entries(
      filteredLogs.reduce<Record<string, number>>((acc, log) => {
        acc[log.module] = (acc[log.module] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-2xl font-bold text-foreground">Behavioral Analytics Layer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Operational audit workspace for user-level behavior tracking. Inspect exactly who did what, where, and when across modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: totalEvents },
          { label: 'Active Users', value: activeUsers },
          { label: 'Failed Actions', value: failedActions },
          { label: 'Most Accessed Module', value: mostAccessedModule }
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
            <p className="text-xl font-bold text-foreground mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action, target, route, tenant..."
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="h-11 rounded-lg border border-border bg-background px-3 text-sm">
            {users.map((user) => (
              <option key={user} value={user}>{user === 'all' ? 'All Users' : user}</option>
            ))}
          </select>

          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="h-11 rounded-lg border border-border bg-background px-3 text-sm">
            {modules.map((module) => (
              <option key={module} value={module}>{module === 'all' ? 'All Modules' : module}</option>
            ))}
          </select>

          <select value={actionTypeFilter} onChange={(e) => setActionTypeFilter(e.target.value as 'all' | ActionType)} className="h-11 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="all">All Action Types</option>
            <option value="View">View</option>
            <option value="Update">Update</option>
            <option value="Create">Create</option>
            <option value="Export">Export</option>
            <option value="Alarm">Alarm</option>
            <option value="Auth">Auth</option>
            <option value="Filter">Filter</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | LogStatus)} className="h-11 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Date from</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Date to</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mt-1" />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setUserFilter('all');
                setModuleFilter('all');
                setActionTypeFilter('all');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="h-10 w-full rounded-lg border border-border text-sm hover:bg-muted"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">User Activity Logs</h3>
          <p className="text-xs text-muted-foreground mt-1">Click any row to inspect full event details.</p>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2.5">Timestamp</th>
                <th className="text-left px-3 py-2.5">User</th>
                <th className="text-left px-3 py-2.5">Role</th>
                <th className="text-left px-3 py-2.5">Action</th>
                <th className="text-left px-3 py-2.5">Module</th>
                <th className="text-left px-3 py-2.5">Target</th>
                <th className="text-left px-3 py-2.5">Status</th>
                <th className="text-left px-3 py-2.5">Tenant</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={cn(
                      'border-t border-border cursor-pointer transition-colors hover:bg-primary/5',
                      selectedLog?.id === log.id && 'bg-primary/10'
                    )}
                  >
                    <td className="px-3 py-2.5 text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-foreground">{log.user}</p>
                      <p className="text-xs text-muted-foreground">{log.email}</p>
                    </td>
                    <td className="px-3 py-2.5">{log.role}</td>
                    <td className="px-3 py-2.5 max-w-[260px]">
                      <span className="inline-flex w-full items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex min-h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold tracking-wide',
                            actionBadgeClass[log.actionType]
                          )}
                        >
                          {actionTypeBadgeLabel[log.actionType]}
                        </span>
                        <span className="min-w-0 truncate text-sm text-foreground" title={log.actionLabel}>
                          {log.actionLabel}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{log.module}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{log.target}</p>
                      <p className="text-xs text-muted-foreground">{log.targetId}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold capitalize', statusBadgeClass[log.status])}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{log.tenant}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center text-muted-foreground py-8" colSpan={8}>No events match current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" onClick={() => setSelectedLog(null)}>
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-start justify-between gap-3 sticky top-0 bg-card/95 backdrop-blur">
              <div>
                <h3 className="text-lg font-bold text-foreground">Activity Event Details</h3>
                <p className="text-xs text-muted-foreground mt-1">Investigation view for event {selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground">Exact action label</p>
                <p className="text-sm font-semibold text-foreground mt-1">{selectedLog.actionLabel}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem label="Page / Route opened" value={selectedLog.route} mono />
                <DetailItem label="Timestamp" value={new Date(selectedLog.timestamp).toLocaleString()} />
                <DetailItem label="Affected object name/id" value={`${selectedLog.target} (${selectedLog.targetId})`} />
                <DetailItem label="Session ID" value={selectedLog.sessionId} mono />
                <DetailItem label="User" value={`${selectedLog.user} • ${selectedLog.email}`} />
                <DetailItem label="Tenant" value={selectedLog.tenant} />
                <DetailItem label="IP Address" value={selectedLog.ipAddress} mono />
                <DetailItem label="Device / Browser" value={selectedLog.deviceBrowser} />
              </div>

              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="rounded-lg border border-border p-4 bg-muted/20">
                  <p className="text-xs font-semibold text-foreground mb-3">Value Changes</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="rounded-md border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Previous value</p>
                      <p className="text-sm font-mono text-foreground mt-1">{selectedLog.previousValue || 'N/A'}</p>
                    </div>
                    <div className="rounded-md border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">New value</p>
                      <p className="text-sm font-mono text-foreground mt-1">{selectedLog.newValue || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground">Details / Description</p>
                <p className="text-sm text-foreground mt-2 leading-relaxed">{selectedLog.details}</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3 bg-muted/20">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-sm text-foreground mt-1', mono && 'font-mono')}>{value}</p>
    </div>
  );
}
