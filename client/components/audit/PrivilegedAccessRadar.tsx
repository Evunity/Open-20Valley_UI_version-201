import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type PrivilegedActionType =
  | 'Opened'
  | 'Created'
  | 'Edited'
  | 'Updated'
  | 'Deleted'
  | 'Exported'
  | 'Logged In'
  | 'Logged Out'
  | 'Changed Permissions'
  | 'Rollback'
  | 'Acknowledged';

interface PrivilegedActivityEvent {
  id: string;
  timestamp: string;
  userName: string;
  email: string;
  privilegedAccount: string;
  actionType: PrivilegedActionType;
  actionLabel: string;
  status: 'authorized' | 'blocked' | 'review';
  module: string;
  target: string;
  tenant: string;
  ipAddress: string;
}

const ACTION_TYPES: PrivilegedActionType[] = [
  'Opened',
  'Created',
  'Edited',
  'Updated',
  'Deleted',
  'Exported',
  'Logged In',
  'Logged Out',
  'Changed Permissions',
  'Rollback',
  'Acknowledged'
];

const PRIVILEGED_EVENTS: PrivilegedActivityEvent[] = [
  {
    id: 'pa_001',
    timestamp: '2026-04-08T10:35:00Z',
    userName: 'Alaa Hassan',
    email: 'alaa.hassan@ovscale.com',
    privilegedAccount: 'ops_admin_eg_north',
    actionType: 'Opened',
    actionLabel: 'Opened Alarm Details ALM-77431',
    status: 'authorized',
    module: 'Alarm Management',
    target: 'ALM-77431',
    tenant: 'Egypt-North',
    ipAddress: '10.20.44.18'
  },
  {
    id: 'pa_002',
    timestamp: '2026-04-08T10:10:00Z',
    userName: 'Reem Khaled',
    email: 'reem.khaled@ovscale.com',
    privilegedAccount: 'rf_admin_temp',
    actionType: 'Updated',
    actionLabel: 'Updated VLAN ID for Cairo-Site-2',
    status: 'authorized',
    module: 'Rollback Management',
    target: 'CELL-CAI2-L18',
    tenant: 'Egypt-North',
    ipAddress: '10.20.40.72'
  },
  {
    id: 'pa_003',
    timestamp: '2026-04-08T09:54:00Z',
    userName: 'Mona Adel',
    email: 'mona.adel@ovscale.com',
    privilegedAccount: 'group_ops_admin',
    actionType: 'Exported',
    actionLabel: 'Exported KPI Report (Daily Availability)',
    status: 'review',
    module: 'Reports',
    target: 'RPT-KPI-221',
    tenant: 'Group-Operations',
    ipAddress: '10.10.1.55'
  },
  {
    id: 'pa_004',
    timestamp: '2026-04-08T09:42:00Z',
    userName: 'Karim Youssef',
    email: 'karim.youssef@ovscale.com',
    privilegedAccount: 'topology_superadmin',
    actionType: 'Created',
    actionLabel: 'Created Transport-Core-Layer',
    status: 'authorized',
    module: 'Topology Management',
    target: 'LYR-0901',
    tenant: 'Egypt-North',
    ipAddress: '10.20.41.12'
  },
  {
    id: 'pa_005',
    timestamp: '2026-04-08T09:20:00Z',
    userName: 'System Admin',
    email: 'system.admin@ovscale.com',
    privilegedAccount: 'platform_root',
    actionType: 'Changed Permissions',
    actionLabel: 'Changed Permissions for role Automation Editor',
    status: 'authorized',
    module: 'Access Control',
    target: 'ROLE-AUTO-EDITOR',
    tenant: 'Global',
    ipAddress: '10.0.0.12'
  },
  {
    id: 'pa_006',
    timestamp: '2026-04-08T08:57:00Z',
    userName: 'Guest User',
    email: 'external.audit@vendor.com',
    privilegedAccount: 'vendor_ro',
    actionType: 'Deleted',
    actionLabel: 'Deleted draft rule attempt (blocked)',
    status: 'blocked',
    module: 'Policy Engine',
    target: 'RULE-DRAFT-91',
    tenant: 'Vendor-Access',
    ipAddress: '172.18.14.44'
  },
  {
    id: 'pa_007',
    timestamp: '2026-04-07T15:30:00Z',
    userName: 'Nour Samir',
    email: 'nour.samir@ovscale.com',
    privilegedAccount: 'noc_privileged',
    actionType: 'Acknowledged',
    actionLabel: 'Acknowledged alarm ALM-77412',
    status: 'authorized',
    module: 'Alarm Management',
    target: 'ALM-77412',
    tenant: 'Egypt-South',
    ipAddress: '10.20.51.99'
  },
  {
    id: 'pa_008',
    timestamp: '2026-04-07T11:05:00Z',
    userName: 'Reem Khaled',
    email: 'reem.khaled@ovscale.com',
    privilegedAccount: 'rf_admin_temp',
    actionType: 'Rollback',
    actionLabel: 'Rollback operation on DL Bandwidth',
    status: 'authorized',
    module: 'Rollback Management',
    target: 'snap_002',
    tenant: 'Egypt-North',
    ipAddress: '10.20.40.72'
  },
  {
    id: 'pa_009',
    timestamp: '2026-04-07T09:14:00Z',
    userName: 'Mona Adel',
    email: 'mona.adel@ovscale.com',
    privilegedAccount: 'group_ops_admin',
    actionType: 'Logged In',
    actionLabel: 'Logged In via SSO + MFA',
    status: 'authorized',
    module: 'Access Control',
    target: 'AUTH-LOGIN',
    tenant: 'Group-Operations',
    ipAddress: '10.10.1.55'
  },
  {
    id: 'pa_010',
    timestamp: '2026-04-06T18:12:00Z',
    userName: 'Mona Adel',
    email: 'mona.adel@ovscale.com',
    privilegedAccount: 'group_ops_admin',
    actionType: 'Logged Out',
    actionLabel: 'Logged Out from command center',
    status: 'authorized',
    module: 'Access Control',
    target: 'AUTH-LOGOUT',
    tenant: 'Group-Operations',
    ipAddress: '10.10.1.55'
  }
];

const statusClass = {
  authorized: 'bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30',
  blocked: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
  review: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
};

const actionClass: Record<PrivilegedActionType, string> = {
  Opened: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  Created: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  Edited: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  Updated: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  Deleted: 'bg-red-500/15 text-red-700 dark:text-red-300',
  Exported: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  'Logged In': 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  'Logged Out': 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
  'Changed Permissions': 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  Rollback: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  Acknowledged: 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
};

export default function PrivilegedAccessRadar() {
  const [search, setSearch] = useState('');
  const [selectedActions, setSelectedActions] = useState<Set<PrivilegedActionType>>(new Set());
  const [timePreset, setTimePreset] = useState<'1h' | '24h' | '7d' | '30d' | 'custom'>('24h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filteredEvents = useMemo(() => {
    const now = Date.now();

    return PRIVILEGED_EVENTS.filter((event) => {
      const eventTime = new Date(event.timestamp).getTime();

      const matchesSearch =
        !search.trim() ||
        [event.userName, event.email, event.privilegedAccount].join(' ').toLowerCase().includes(search.trim().toLowerCase());

      const matchesAction = selectedActions.size === 0 || selectedActions.has(event.actionType);

      let matchesTime = true;
      if (timePreset === '1h') matchesTime = eventTime >= now - 60 * 60 * 1000;
      if (timePreset === '24h') matchesTime = eventTime >= now - 24 * 60 * 60 * 1000;
      if (timePreset === '7d') matchesTime = eventTime >= now - 7 * 24 * 60 * 60 * 1000;
      if (timePreset === '30d') matchesTime = eventTime >= now - 30 * 24 * 60 * 60 * 1000;
      if (timePreset === 'custom') {
        const eventDate = event.timestamp.slice(0, 10);
        const fromOk = !customFrom || eventDate >= customFrom;
        const toOk = !customTo || eventDate <= customTo;
        matchesTime = fromOk && toOk;
      }

      return matchesSearch && matchesAction && matchesTime;
    });
  }, [customFrom, customTo, search, selectedActions, timePreset]);

  const toggleActionType = (actionType: PrivilegedActionType) => {
    const next = new Set(selectedActions);
    if (next.has(actionType)) next.delete(actionType);
    else next.add(actionType);
    setSelectedActions(next);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-foreground">Privileged Access Radar</h3>
          <button
            onClick={() => {
              setSearch('');
              setSelectedActions(new Set());
              setTimePreset('24h');
              setCustomFrom('');
              setCustomTo('');
            }}
            className="h-9 px-3 rounded-lg border border-border text-sm hover:bg-muted"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, privileged account..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
            />
          </div>

          <select
            value={timePreset}
            onChange={(e) => setTimePreset(e.target.value as '1h' | '24h' | '7d' | '30d' | 'custom')}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="1h">Last 1 hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>

          <div className="rounded-lg border border-border bg-background p-2">
            <p className="text-xs text-muted-foreground mb-2">Action type filter (multi-select)</p>
            <div className="flex flex-wrap gap-1.5">
              {ACTION_TYPES.map((actionType) => {
                const selected = selectedActions.has(actionType);
                return (
                  <button
                    key={actionType}
                    onClick={() => toggleActionType(actionType)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium border transition',
                      selected
                        ? 'bg-primary/15 text-primary border-primary/40'
                        : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/30'
                    )}
                  >
                    {actionType}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {timePreset === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-foreground">Privileged Activity Records</h4>
          <p className="text-xs text-muted-foreground mt-1">Investigation feed filtered by time, user/account search, and action type.</p>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2.5">Timestamp</th>
                  <th className="text-left px-3 py-2.5">User</th>
                  <th className="text-left px-3 py-2.5">Privileged Account</th>
                  <th className="text-left px-3 py-2.5">Action</th>
                  <th className="text-left px-3 py-2.5">Module</th>
                  <th className="text-left px-3 py-2.5">Target</th>
                  <th className="text-left px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-t border-border hover:bg-primary/5">
                    <td className="px-3 py-2.5 font-mono text-xs">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-foreground">{event.userName}</p>
                      <p className="text-xs text-muted-foreground">{event.email}</p>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">{event.privilegedAccount}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('px-2 py-1 rounded-md text-xs font-semibold', actionClass[event.actionType])}>{event.actionType}</span>
                      <p className="text-xs text-muted-foreground mt-1">{event.actionLabel}</p>
                    </td>
                    <td className="px-3 py-2.5">{event.module}</td>
                    <td className="px-3 py-2.5">{event.target}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold capitalize', statusClass[event.status])}>{event.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-foreground">No privileged activity records found</p>
            <p className="text-xs text-muted-foreground mt-1">Try broadening time range, search keywords, or selected action types.</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/50 p-5 bg-card/50">
        <h4 className="font-semibold text-foreground mb-3">Privilege Access Controls</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <PolicyItem title="✓ Multi-Factor Authentication" description="All privileged operations require MFA." />
          <PolicyItem title="✓ Dual Approval" description="Permission changes require dual admin approval." />
          <PolicyItem title="✓ DLP Enforcement" description="Large exports are inspected and logged." />
          <PolicyItem title="✓ Time-Based Constraints" description="Off-hours privileged access is policy-gated." />
        </div>
      </div>
    </div>
  );
}

function PolicyItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
