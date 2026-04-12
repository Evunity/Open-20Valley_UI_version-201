import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Download, MoreHorizontal, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRule,
  deleteRule,
  exportSecurityPolicies,
  getApprovalById,
  getSecurityPolicies,
  patchApproval,
  patchEmergencyGuardrail,
  patchRule,
  type EmergencyGuardrails,
  type SeparationOfDutiesRule,
  type SeparationOfDutiesRuleStatus,
  type TenantAwareApproval,
  type TenantAwareApprovalStatus,
} from "@/services/accessControlSecurityPoliciesService";

type GuardrailKey = keyof EmergencyGuardrails;

type RuleDraft = {
  ruleText: string;
  actionA: string;
  actionB: string;
  status: SeparationOfDutiesRuleStatus;
};

const ACTION_OPTIONS = [
  "Create Automation",
  "Approve Automation",
  "Modify Policy",
  "Audit Policy",
  "Execute Script",
  "Approve Script",
  "Export Data",
];

const statusChip: Record<TenantAwareApprovalStatus, string> = {
  Awaiting: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Approved: "bg-green-500/15 text-green-700 dark:text-green-300",
  Denied: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export default function SecurityPolicies() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [guardrails, setGuardrails] = useState<EmergencyGuardrails | null>(null);
  const [rules, setRules] = useState<SeparationOfDutiesRule[]>([]);
  const [approvals, setApprovals] = useState<TenantAwareApproval[]>([]);

  const [guardrailDialogOpen, setGuardrailDialogOpen] = useState(false);
  const [pendingGuardrail, setPendingGuardrail] = useState<{ key: GuardrailKey; value: boolean } | null>(null);
  const [guardrailReason, setGuardrailReason] = useState("");
  const [guardrailSaving, setGuardrailSaving] = useState(false);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleDraft, setRuleDraft] = useState<RuleDraft>({ ruleText: "", actionA: "", actionB: "", status: "Active" });
  const [ruleError, setRuleError] = useState<string | null>(null);

  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [activeApproval, setActiveApproval] = useState<TenantAwareApproval | null>(null);

  const currentUserCanAct = true;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSecurityPolicies();
      setGuardrails(data.emergencyGuardrails);
      setRules(data.rules);
      setApprovals(data.approvals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security policies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openGuardrailConfirmation = (key: GuardrailKey, value: boolean) => {
    setPendingGuardrail({ key, value });
    setGuardrailReason("");
    setGuardrailDialogOpen(true);
  };

  const submitGuardrailChange = async () => {
    if (!pendingGuardrail) return;
    if (!guardrailReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for this critical action.", variant: "destructive" });
      return;
    }

    setGuardrailSaving(true);
    const previous = guardrails;

    try {
      setGuardrails((prev) => (prev ? { ...prev, [pendingGuardrail.key]: pendingGuardrail.value } : prev));
      const updated = await patchEmergencyGuardrail({ key: pendingGuardrail.key, value: pendingGuardrail.value, reason: guardrailReason });
      setGuardrails(updated);
      toast({ title: "Guardrail updated", description: "Global control updated successfully." });
      setGuardrailDialogOpen(false);
      setPendingGuardrail(null);
    } catch (err) {
      if (previous) setGuardrails(previous);
      toast({ title: "Update failed", description: err instanceof Error ? err.message : "Could not update guardrail.", variant: "destructive" });
    } finally {
      setGuardrailSaving(false);
    }
  };

  const onExportPolicies = async () => {
    try {
      const content = await exportSecurityPolicies();
      const blob = new Blob([content], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "security-policies-export.json";
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete", description: "Policy export downloaded." });
    } catch (err) {
      toast({ title: "Export failed", description: err instanceof Error ? err.message : "Unable to export policy data.", variant: "destructive" });
    }
  };

  const openCreateRule = () => {
    setEditingRuleId(null);
    setRuleDraft({ ruleText: "", actionA: "", actionB: "", status: "Active" });
    setRuleError(null);
    setRuleDialogOpen(true);
  };

  const openEditRule = (rule: SeparationOfDutiesRule) => {
    setEditingRuleId(rule.id);
    setRuleDraft({ ruleText: rule.ruleText, actionA: rule.actionA, actionB: rule.actionB, status: rule.status });
    setRuleError(null);
    setRuleDialogOpen(true);
  };

  const saveRule = async () => {
    setRuleError(null);
    if (!ruleDraft.ruleText.trim() || !ruleDraft.actionA || !ruleDraft.actionB) {
      setRuleError("Rule text, Action A, and Action B are required.");
      return;
    }

    try {
      if (editingRuleId) {
        const updated = await patchRule(editingRuleId, { ...ruleDraft });
        setRules((prev) => prev.map((rule) => (rule.id === editingRuleId ? updated : rule)));
        toast({ title: "Rule updated", description: "Separation of duties rule was updated." });
      } else {
        const created = await createRule(ruleDraft);
        setRules((prev) => [created, ...prev]);
        toast({ title: "Rule created", description: "New separation of duties rule added." });
      }
      setRuleDialogOpen(false);
    } catch (err) {
      setRuleError(err instanceof Error ? err.message : "Unable to save rule.");
    }
  };

  const removeRule = async (ruleId: string) => {
    if (!window.confirm("Delete this rule?")) return;
    const prev = rules;
    setRules((list) => list.filter((rule) => rule.id !== ruleId));

    try {
      await deleteRule(ruleId);
      toast({ title: "Rule deleted", description: "Rule has been removed." });
    } catch (err) {
      setRules(prev);
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : "Could not delete rule.", variant: "destructive" });
    }
  };

  const toggleRuleStatus = async (rule: SeparationOfDutiesRule) => {
    const nextStatus: SeparationOfDutiesRuleStatus = rule.status === "Active" ? "Inactive" : "Active";
    try {
      const updated = await patchRule(rule.id, { status: nextStatus });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      toast({ title: "Rule status updated", description: `${rule.ruleText} is now ${nextStatus}.` });
    } catch (err) {
      toast({ title: "Status update failed", description: err instanceof Error ? err.message : "Unable to update status.", variant: "destructive" });
    }
  };

  const openApproval = async (approvalId: string) => {
    setApprovalDialogOpen(true);
    setApprovalLoading(true);
    try {
      const detail = await getApprovalById(approvalId);
      setActiveApproval(detail);
    } catch (err) {
      toast({ title: "Load failed", description: err instanceof Error ? err.message : "Unable to load approval details.", variant: "destructive" });
      setApprovalDialogOpen(false);
    } finally {
      setApprovalLoading(false);
    }
  };

  const updateApprovalStatus = async (status: TenantAwareApprovalStatus, note?: string) => {
    if (!activeApproval) return;
    try {
      const updated = await patchApproval(activeApproval.id, {
        status,
        detailText: note ? `${activeApproval.detailText}\n${note}` : activeApproval.detailText,
        approvedBy: status === "Awaiting" ? null : "Current Operator",
      });
      setActiveApproval(updated);
      setApprovals((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast({ title: "Approval updated", description: `Request marked as ${status}.` });
    } catch (err) {
      toast({ title: "Action failed", description: err instanceof Error ? err.message : "Could not update request.", variant: "destructive" });
    }
  };

  const guardrailItems = useMemo(() => {
    if (!guardrails) return [];
    return [
      {
        key: "globalAutomationKillSwitch" as const,
        title: "Global Automation Kill Switch",
        description: "Immediately halt all automated processes across all tenants",
        enabled: guardrails.globalAutomationKillSwitch,
      },
      {
        key: "globalExportFreeze" as const,
        title: "Global Export Freeze",
        description: "Block all data export operations system-wide",
        enabled: guardrails.globalExportFreeze,
      },
      {
        key: "emergencyReadOnlyMode" as const,
        title: "Emergency Read-Only Mode",
        description: "Force all users into read-only mode globally",
        enabled: guardrails.emergencyReadOnlyMode,
      },
    ];
  }, [guardrails]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
        {error}
        <button className="ml-2 underline" onClick={loadData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onExportPolicies} className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted">
        <Download className="h-4 w-4" />
        Export Policies
      </button>

      <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
        <div className="mb-3 flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <h3 className="text-sm font-semibold text-red-700">Emergency Guardrails</h3>
            <p className="text-xs text-red-700/90">Global controls for critical incidents. Use with extreme caution.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {guardrailItems.map((item) => (
            <div key={item.key} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch checked={item.enabled} onCheckedChange={(checked) => openGuardrailConfirmation(item.key, checked)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Separation of Duties Rules</h3>
            <button onClick={openCreateRule} className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> Add Rule
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Rule</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Action A</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Action B</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-3 py-2.5">
                      <button onClick={() => openEditRule(rule)} className="text-left text-sm text-foreground hover:text-primary">{rule.ruleText}</button>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{rule.actionA}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{rule.actionB}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={rule.status === "Active" ? "rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-700" : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"}>{rule.status}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 hover:bg-muted"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEditRule(rule)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toggleRuleStatus(rule)}>{rule.status === "Active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => removeRule(rule.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-3">
          <h3 className="text-sm font-semibold">Tenant-Aware Approvals</h3>
          <div className="mt-2 divide-y divide-border">
            {approvals.map((approval) => (
              <button key={approval.id} onClick={() => openApproval(approval.id)} className="w-full py-2 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{approval.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusChip[approval.status]}`}>{approval.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{approval.summary}</p>
                <p className="mt-1 text-[11px] text-primary">{approval.detailText}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={guardrailDialogOpen} onOpenChange={setGuardrailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Emergency Change</DialogTitle>
            <DialogDescription>This action is audit-logged and affects all tenants globally.</DialogDescription>
          </DialogHeader>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Reason *</span>
            <textarea value={guardrailReason} onChange={(e) => setGuardrailReason(e.target.value)} className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <DialogFooter>
            <button className="h-9 rounded-md border border-input px-3 text-sm" onClick={() => setGuardrailDialogOpen(false)}>Cancel</button>
            <button className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40" disabled={guardrailSaving} onClick={submitGuardrailChange}>
              {guardrailSaving ? "Saving..." : "Confirm"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRuleId ? "Edit Rule" : "Add Rule"}</DialogTitle>
            <DialogDescription>Manage separation of duties constraints.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Rule Text *">
              <input value={ruleDraft.ruleText} onChange={(e) => setRuleDraft((prev) => ({ ...prev, ruleText: e.target.value }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </Field>
            <Field label="Action A *">
              <Select value={ruleDraft.actionA || "none"} onValueChange={(value) => setRuleDraft((prev) => ({ ...prev, actionA: value === "none" ? "" : value }))}>
                <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select action</SelectItem>
                  {ACTION_OPTIONS.map((action) => <SelectItem key={action} value={action}>{action}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Action B *">
              <Select value={ruleDraft.actionB || "none"} onValueChange={(value) => setRuleDraft((prev) => ({ ...prev, actionB: value === "none" ? "" : value }))}>
                <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select action</SelectItem>
                  {ACTION_OPTIONS.map((action) => <SelectItem key={action} value={action}>{action}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={ruleDraft.status} onValueChange={(value) => setRuleDraft((prev) => ({ ...prev, status: value as SeparationOfDutiesRuleStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {ruleError && <p className="text-xs text-red-600">{ruleError}</p>}
          </div>
          <DialogFooter>
            <button className="h-9 rounded-md border border-input px-3 text-sm" onClick={() => setRuleDialogOpen(false)}>Cancel</button>
            <button className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90" onClick={saveRule}>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval Details</DialogTitle>
            <DialogDescription>Tenant-aware approval workflow context.</DialogDescription>
          </DialogHeader>
          {approvalLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted/50" />
            </div>
          ) : activeApproval ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Title:</span> {activeApproval.title}</p>
              <p><span className="text-muted-foreground">Status:</span> {activeApproval.status}</p>
              <p><span className="text-muted-foreground">Requested By:</span> {activeApproval.requestedBy}</p>
              <p><span className="text-muted-foreground">Tenant:</span> {activeApproval.tenantId}</p>
              <p><span className="text-muted-foreground">Created:</span> {new Date(activeApproval.createdAt).toLocaleString()}</p>
              <p><span className="text-muted-foreground">Updated:</span> {activeApproval.updatedAt ? new Date(activeApproval.updatedAt).toLocaleString() : "-"}</p>
              <p><span className="text-muted-foreground">Approval Chain:</span> {activeApproval.approvalChain?.join(" → ")}</p>
              <p className="text-muted-foreground">{activeApproval.detailText}</p>
            </div>
          ) : null}
          {currentUserCanAct && activeApproval && (
            <DialogFooter>
              <button className="h-9 rounded-md border border-input px-3 text-sm" onClick={() => updateApprovalStatus("Awaiting", "More info requested by reviewer")}>Request More Info</button>
              <button className="h-9 rounded-md border border-input px-3 text-sm" onClick={() => updateApprovalStatus("Awaiting", "Escalated to governance board")}>Escalate</button>
              <button className="h-9 rounded-md border border-red-500/30 px-3 text-sm text-red-700" onClick={() => updateApprovalStatus("Denied")}>Deny</button>
              <button className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground" onClick={() => updateApprovalStatus("Approved")}>Approve</button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
