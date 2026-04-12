import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportAuditTrail,
  getAuditEventById,
  getAuditTrail,
  type AuditEvent,
  type AuditTrailFilters,
  type AuditTrailTab,
} from "@/services/accessControlAuditTrailService";

const TABS: Array<{ id: AuditTrailTab; label: string }> = [
  { id: "all", label: "All Activity" },
  { id: "access_denied", label: "Access Denied" },
  { id: "privilege_elevation", label: "Privilege Elevation" },
  { id: "cross_tenant", label: "Cross-Tenant" },
  { id: "tenant_changes", label: "Tenant Changes" },
];

const PAGE_SIZE = 10;

const resultStyle: Record<AuditEvent["result"], string> = {
  Active: "bg-green-500/15 text-green-700 dark:text-green-300",
  Denied: "bg-red-500/15 text-red-700 dark:text-red-300",
  Elevated: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "X-Tenant": "bg-primary/15 text-primary",
};

export default function AuditTrailWorkspace() {
  const { toast } = useToast();

  const [filters, setFilters] = useState<AuditTrailFilters>({
    tab: "all",
    query: "",
    dateRange: "Last 7 Days",
    tenantScope: "All Tenants",
    severity: "All Severity",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, query: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditTrail(filters);
      setRows(data.events);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [filters]);

  const tenantOptions = useMemo(() => {
    const unique = new Set(rows.map((row) => row.tenant));
    return ["All Tenants", ...Array.from(unique)];
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const start = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const end = Math.min(total, filters.page * filters.pageSize);

  const updateFilter = (patch: Partial<AuditTrailFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  const openDetail = async (eventId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await getAuditEventById(eventId);
      setActiveEvent(detail);
    } catch (err) {
      toast({ title: "Failed to load event", description: err instanceof Error ? err.message : "Unable to load details.", variant: "destructive" });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const onExport = async () => {
    try {
      const csv = await exportAuditTrail(filters);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "audit-trail-export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : "Unable to export logs.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onExport} className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted">
        <Download className="h-4 w-4" />
        Export Log
      </button>

      <div className="border-b border-border">
        <div className="flex flex-wrap gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateFilter({ tab: tab.id })}
              className={cn(
                "pb-2 text-sm font-medium",
                filters.tab === tab.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search audit logs..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filters.dateRange} onValueChange={(value) => updateFilter({ dateRange: value })}>
            <SelectTrigger className="h-9 w-[132px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Last 24 Hours">Last 24 Hours</SelectItem>
              <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
              <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.tenantScope} onValueChange={(value) => updateFilter({ tenantScope: value })}>
            <SelectTrigger className="h-9 w-[132px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {tenantOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.severity} onValueChange={(value) => updateFilter({ severity: value })}>
            <SelectTrigger className="h-9 w-[132px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All Severity">All Severity</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {error && (
          <div className="m-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700">
            {error}
            <button onClick={loadRows} className="ml-2 underline">Retry</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold">Timestamp</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">User</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Tenant</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Action</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Module</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-t border-border">
                    <td colSpan={6} className="px-3 py-2.5"><div className="h-5 animate-pulse rounded bg-muted/40" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">No audit events match the current filters.</td>
                </tr>
              ) : (
                rows.map((event) => (
                  <tr key={event.id} className="cursor-pointer border-t border-border hover:bg-muted/20" onClick={() => openDetail(event.id)}>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-sm text-foreground">{event.user}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{event.tenant}</td>
                    <td className="px-3 py-2.5 text-sm text-foreground">{event.action}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground">{event.module}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", resultStyle[event.result])}>{event.result}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>Showing {start}-{end} of {total} events</span>
          <div className="flex items-center gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => updateFilter({ page: filters.page - 1 })}
              className="h-7 rounded border border-input px-2 disabled:opacity-40"
            >
              Prev
            </button>
            <span>Page {filters.page} / {totalPages}</span>
            <button
              disabled={filters.page >= totalPages}
              onClick={() => updateFilter({ page: filters.page + 1 })}
              className="h-7 rounded border border-input px-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Event Details</DialogTitle>
            <DialogDescription>Full metadata and operational context.</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-2">
              <div className="h-4 animate-pulse rounded bg-muted/40" />
              <div className="h-4 animate-pulse rounded bg-muted/40" />
            </div>
          ) : activeEvent ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Timestamp:</span> {new Date(activeEvent.timestamp).toLocaleString()}</p>
              <p><span className="text-muted-foreground">User:</span> {activeEvent.user}</p>
              <p><span className="text-muted-foreground">Tenant:</span> {activeEvent.tenant}</p>
              <p><span className="text-muted-foreground">Action:</span> {activeEvent.action}</p>
              <p><span className="text-muted-foreground">Module:</span> {activeEvent.module}</p>
              <p><span className="text-muted-foreground">Severity:</span> {activeEvent.severity}</p>
              <p><span className="text-muted-foreground">Result:</span> {activeEvent.result}</p>
              <p><span className="text-muted-foreground">Details:</span> {activeEvent.details}</p>
              <pre className="max-h-[180px] overflow-auto rounded bg-muted/30 p-2 text-xs">{JSON.stringify(activeEvent.metadata ?? {}, null, 2)}</pre>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
