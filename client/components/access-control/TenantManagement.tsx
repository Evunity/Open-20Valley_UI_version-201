import { useEffect, useMemo, useState } from "react";
import { Archive, RotateCcw, Save, Search, ShieldCheck, PauseCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type PlatformModuleKey =
  | "dashboard"
  | "analytics_management"
  | "alarm_management"
  | "automation_ai"
  | "topology_network"
  | "command_center"
  | "activity_audit"
  | "reports"
  | "access_control"
  | "settings";

type TenantModuleAccess = {
  moduleKey: PlatformModuleKey;
  enabled: boolean;
};

type TenantPolicy = {
  mfaRequired: boolean;
  automationApprovalRequired: boolean;
  exportLimitsEnforced: boolean;
  autonomousAiDisabled: boolean;
};

type LifecycleStatus = "Active" | "Suspended" | "Archived";

type Tenant = {
  id: string;
  tenantName: string;
  country: string;
  timezone: string;
  organizationType: string;
  dataRetentionPolicy: string;
  securityLevel: string;
  allowedEmailDomains: string[];
  ipAllowlist: string[];
  regulatoryProfile: string | null;
  policy: TenantPolicy;
  moduleAccess: TenantModuleAccess[];
  lifecycleStatus: LifecycleStatus;
};

const STORAGE_KEY = "tenant_management_workspace_v2";

const MODULES: Array<{ key: PlatformModuleKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "analytics_management", label: "Analytics Management" },
  { key: "alarm_management", label: "Alarm Management" },
  { key: "automation_ai", label: "Automation & AI" },
  { key: "topology_network", label: "Topology & Network" },
  { key: "command_center", label: "Command Center" },
  { key: "activity_audit", label: "Activity & Audit" },
  { key: "reports", label: "Reports" },
  { key: "access_control", label: "Access Control" },
  { key: "settings", label: "Settings" },
];

const COUNTRIES = ["Global", "Egypt", "Saudi Arabia", "UAE", "United States", "Germany"];
const TIMEZONES = ["UTC", "Africa/Cairo", "Asia/Riyadh", "Asia/Dubai", "America/New_York", "Europe/Berlin"];
const ORG_TYPES = ["Parent Group", "Operator", "Managed Services", "Enterprise", "Government"];
const RETENTION_POLICIES = ["6 Months", "12 Months", "24 Months", "36 Months", "7 Years", "10 Years"];
const SECURITY_LEVELS = ["Medium", "High", "Critical"];
const REGULATORY_PROFILES = ["None", "NTRA + GDPR", "CST + ISO27001", "NIST + ISO27001", "SOC2 + ISO27001"];

const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const ipOrCidrRegex = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})(?:\/(?:[0-9]|[12][0-9]|3[0-2]))?$/;

const buildModuleAccess = (overrides?: Partial<Record<PlatformModuleKey, boolean>>): TenantModuleAccess[] =>
  MODULES.map(({ key }) => ({ moduleKey: key, enabled: overrides?.[key] ?? true }));

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: "telecom-group",
    tenantName: "Telecom Group",
    country: "Global",
    timezone: "UTC",
    organizationType: "Parent Group",
    dataRetentionPolicy: "36 Months",
    securityLevel: "Critical",
    allowedEmailDomains: ["telecom-group.com"],
    ipAllowlist: ["10.0.0.0/16"],
    regulatoryProfile: "NIST + ISO27001",
    policy: { mfaRequired: true, automationApprovalRequired: true, exportLimitsEnforced: true, autonomousAiDisabled: false },
    moduleAccess: buildModuleAccess(),
    lifecycleStatus: "Active",
  },
  {
    id: "egypt-operator",
    tenantName: "Egypt Operator",
    country: "Egypt",
    timezone: "Africa/Cairo",
    organizationType: "Operator",
    dataRetentionPolicy: "12 Months",
    securityLevel: "High",
    allowedEmailDomains: ["egypt-operator.com", "ovscale.eg"],
    ipAllowlist: ["10.20.0.0/16"],
    regulatoryProfile: "NTRA + GDPR",
    policy: { mfaRequired: true, automationApprovalRequired: true, exportLimitsEnforced: true, autonomousAiDisabled: false },
    moduleAccess: buildModuleAccess({ automation_ai: false }),
    lifecycleStatus: "Active",
  },
  {
    id: "saudi-operator",
    tenantName: "Saudi Operator",
    country: "Saudi Arabia",
    timezone: "Asia/Riyadh",
    organizationType: "Operator",
    dataRetentionPolicy: "24 Months",
    securityLevel: "Critical",
    allowedEmailDomains: ["saudi-operator.com"],
    ipAllowlist: ["172.16.0.0/16"],
    regulatoryProfile: "CST + ISO27001",
    policy: { mfaRequired: true, automationApprovalRequired: true, exportLimitsEnforced: true, autonomousAiDisabled: true },
    moduleAccess: buildModuleAccess({ reports: false }),
    lifecycleStatus: "Active",
  },
  {
    id: "managed-services",
    tenantName: "Managed Services",
    country: "Global",
    timezone: "UTC",
    organizationType: "Managed Services",
    dataRetentionPolicy: "24 Months",
    securityLevel: "High",
    allowedEmailDomains: ["managed-svcs.com"],
    ipAllowlist: ["10.30.0.0/16"],
    regulatoryProfile: "SOC2 + ISO27001",
    policy: { mfaRequired: true, automationApprovalRequired: false, exportLimitsEnforced: true, autonomousAiDisabled: false },
    moduleAccess: buildModuleAccess({ command_center: false }),
    lifecycleStatus: "Suspended",
  },
  {
    id: "enterprise-networks",
    tenantName: "Enterprise Networks",
    country: "United States",
    timezone: "America/New_York",
    organizationType: "Enterprise",
    dataRetentionPolicy: "7 Years",
    securityLevel: "High",
    allowedEmailDomains: ["enterprise-networks.com"],
    ipAllowlist: ["192.168.10.0/24"],
    regulatoryProfile: "SOC2 + ISO27001",
    policy: { mfaRequired: true, automationApprovalRequired: true, exportLimitsEnforced: false, autonomousAiDisabled: false },
    moduleAccess: buildModuleAccess({ alarm_management: false, topology_network: false }),
    lifecycleStatus: "Active",
  },
  {
    id: "europe-operations",
    tenantName: "Europe Operations",
    country: "Germany",
    timezone: "Europe/Berlin",
    organizationType: "Operator",
    dataRetentionPolicy: "10 Years",
    securityLevel: "Critical",
    allowedEmailDomains: ["europe-ops.de"],
    ipAllowlist: ["10.99.0.0/16"],
    regulatoryProfile: "NIST + ISO27001",
    policy: { mfaRequired: true, automationApprovalRequired: true, exportLimitsEnforced: true, autonomousAiDisabled: true },
    moduleAccess: buildModuleAccess({ automation_ai: false, settings: false }),
    lifecycleStatus: "Archived",
  },
];

const normalizeTenant = (tenant: Tenant): Tenant => {
  const existing = new Map(tenant.moduleAccess.map((entry) => [entry.moduleKey, entry.enabled]));
  return {
    ...tenant,
    regulatoryProfile: tenant.regulatoryProfile || null,
    moduleAccess: MODULES.map(({ key }) => ({ moduleKey: key, enabled: existing.get(key) ?? false })),
  };
};

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>(DEFAULT_TENANTS.map(normalizeTenant));
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState(DEFAULT_TENANTS[0].id);
  const [savedTenant, setSavedTenant] = useState<Tenant>(deepClone(normalizeTenant(DEFAULT_TENANTS[0])));
  const [draft, setDraft] = useState<Tenant>(deepClone(normalizeTenant(DEFAULT_TENANTS[0])));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Tenant[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const normalized = parsed.map(normalizeTenant);
      setTenants(normalized);
      const initial = normalized[0];
      setSelectedTenantId(initial.id);
      setSavedTenant(deepClone(initial));
      setDraft(deepClone(initial));
    } catch {
      // preserve defaults
    }
  }, []);

  const filteredTenants = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tenants;
    return tenants.filter((tenant) => {
      return [tenant.tenantName, tenant.country, tenant.organizationType, tenant.lifecycleStatus].join(" ").toLowerCase().includes(term);
    });
  }, [tenants, search]);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedTenant), [draft, savedTenant]);
  const enabledModules = useMemo(() => draft.moduleAccess.filter((module) => module.enabled).length, [draft.moduleAccess]);

  const loadTenant = (tenantId: string) => {
    const next = tenants.find((tenant) => tenant.id === tenantId);
    if (!next) return;
    if (isDirty) {
      const proceed = window.confirm("You have unsaved changes. Discard and switch tenant?");
      if (!proceed) return;
    }
    setSelectedTenantId(tenantId);
    setSavedTenant(deepClone(next));
    setDraft(deepClone(next));
    setErrors({});
    setFeedback(null);
  };

  const updateDraft = <K extends keyof Tenant>(field: K, value: Tenant[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  };

  const updatePolicy = (key: keyof TenantPolicy, value: boolean) => {
    setDraft((prev) => ({ ...prev, policy: { ...prev.policy, [key]: value } }));
    setFeedback(null);
  };

  const updateModuleAccess = (moduleKey: PlatformModuleKey, enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      moduleAccess: prev.moduleAccess.map((module) => (module.moduleKey === moduleKey ? { ...module, enabled } : module)),
    }));
    setFeedback(null);
  };

  const setAllModules = (enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      moduleAccess: prev.moduleAccess.map((module) => ({ ...module, enabled })),
    }));
    setFeedback(null);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.tenantName.trim()) nextErrors.tenantName = "Tenant Name is required.";
    if (!draft.country) nextErrors.country = "Country is required.";
    if (!draft.timezone) nextErrors.timezone = "Timezone is required.";
    if (!draft.organizationType) nextErrors.organizationType = "Organization Type is required.";
    if (!draft.dataRetentionPolicy) nextErrors.dataRetentionPolicy = "Data Retention Policy is required.";
    if (!draft.securityLevel) nextErrors.securityLevel = "Security Level is required.";

    draft.allowedEmailDomains.forEach((domain) => {
      if (!domainRegex.test(domain)) {
        nextErrors.allowedEmailDomains = `Invalid email domain: ${domain}`;
      }
    });
    draft.ipAllowlist.forEach((entry) => {
      if (!ipOrCidrRegex.test(entry)) {
        nextErrors.ipAllowlist = `Invalid IP/CIDR: ${entry}`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const persistTenant = (updated: Tenant) => {
    const nextTenants = tenants.map((tenant) => (tenant.id === updated.id ? updated : tenant));
    setTenants(nextTenants);
    setSavedTenant(deepClone(updated));
    setDraft(deepClone(updated));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTenants));
  };

  const handleSave = () => {
    if (!validate()) {
      setFeedback("Please resolve validation errors before saving.");
      return;
    }
    persistTenant(draft);
    setFeedback("Tenant settings saved successfully.");
  };

  const handleCancel = () => {
    setDraft(deepClone(savedTenant));
    setErrors({});
    setFeedback("Unsaved changes were reverted.");
  };

  const updateListField = (field: "allowedEmailDomains" | "ipAllowlist", value: string) => {
    const list = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    updateDraft(field, list);
  };

  const applyLifecycleStatus = (status: LifecycleStatus) => {
    if (draft.lifecycleStatus === status) return;
    const confirmed = window.confirm(`Set ${draft.tenantName} status to ${status}?`);
    if (!confirmed) return;
    const updated = { ...draft, lifecycleStatus: status };
    persistTenant(updated);
    setFeedback(`Lifecycle status updated to ${status}.`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Tenant Management Workspace</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Unified tenant administration for summary, policies, restrictions, module access, and lifecycle controls.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-border bg-card p-3">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tenants"
              className="pl-9"
              aria-label="Search tenants"
            />
          </div>
          <p className="mb-2 text-xs text-muted-foreground">Showing {filteredTenants.length} of {tenants.length} tenants</p>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredTenants.map((tenant) => {
              const isSelected = tenant.id === selectedTenantId;
              return (
                <button
                  key={tenant.id}
                  onClick={() => loadTenant(tenant.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition",
                    isSelected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{tenant.tenantName}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        tenant.lifecycleStatus === "Active"
                          ? "bg-green-500/15 text-green-700"
                          : tenant.lifecycleStatus === "Suspended"
                            ? "bg-amber-500/15 text-amber-700"
                            : "bg-red-500/15 text-red-700",
                      )}
                    >
                      {tenant.lifecycleStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{tenant.country} • {tenant.organizationType}</p>
                </button>
              );
            })}
            {filteredTenants.length === 0 && <p className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">No tenants match the current search.</p>}
          </div>
        </aside>

        <section className="min-h-0 space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">{draft.tenantName}</h3>
              <p className="text-xs text-muted-foreground">Tenant ID: {draft.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={!isDirty}>
                <RotateCcw className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4" />
                Save Tenant
              </Button>
            </div>
          </div>

          <Section title="Tenant Summary">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Summary label="Lifecycle" value={draft.lifecycleStatus} />
              <Summary label="Security Level" value={draft.securityLevel} />
              <Summary label="Modules Enabled" value={`${enabledModules}/${MODULES.length}`} />
              <Summary label="Regulatory" value={draft.regulatoryProfile ?? "None"} />
            </div>
          </Section>

          <Section title="Basic Information">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Tenant Name" error={errors.tenantName}>
                <Input value={draft.tenantName} onChange={(event) => updateDraft("tenantName", event.target.value)} />
              </Field>
              <Field label="Country" error={errors.country}>
                <Select value={draft.country} onValueChange={(value) => updateDraft("country", value)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Timezone" error={errors.timezone}>
                <Select value={draft.timezone} onValueChange={(value) => updateDraft("timezone", value)}>
                  <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>{TIMEZONES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Organization Type" error={errors.organizationType}>
                <Select value={draft.organizationType} onValueChange={(value) => updateDraft("organizationType", value)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{ORG_TYPES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Security & Retention">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Data Retention Policy" error={errors.dataRetentionPolicy}>
                <Select value={draft.dataRetentionPolicy} onValueChange={(value) => updateDraft("dataRetentionPolicy", value)}>
                  <SelectTrigger><SelectValue placeholder="Select retention" /></SelectTrigger>
                  <SelectContent>{RETENTION_POLICIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Security Level" error={errors.securityLevel}>
                <Select value={draft.securityLevel} onValueChange={(value) => updateDraft("securityLevel", value)}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>{SECURITY_LEVELS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Optional Restrictions">
            <div className="grid grid-cols-1 gap-3">
              <Field label="Allowed Email Domains (comma separated)" error={errors.allowedEmailDomains}>
                <Input
                  value={draft.allowedEmailDomains.join(", ")}
                  onChange={(event) => updateListField("allowedEmailDomains", event.target.value)}
                  placeholder="example.com, another.com"
                />
              </Field>
              <Field label="IP Allowlist (comma separated)" error={errors.ipAllowlist}>
                <Input
                  value={draft.ipAllowlist.join(", ")}
                  onChange={(event) => updateListField("ipAllowlist", event.target.value)}
                  placeholder="10.0.0.0/24, 172.16.0.10"
                />
              </Field>
              <Field label="Regulatory Profile">
                <Select value={draft.regulatoryProfile ?? "None"} onValueChange={(value) => updateDraft("regulatoryProfile", value === "None" ? null : value)}>
                  <SelectTrigger><SelectValue placeholder="Select profile" /></SelectTrigger>
                  <SelectContent>{REGULATORY_PROFILES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Policy Controls">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <PolicySwitch label="MFA Required" value={draft.policy.mfaRequired} onChange={(value) => updatePolicy("mfaRequired", value)} />
              <PolicySwitch label="Automation Approval Required" value={draft.policy.automationApprovalRequired} onChange={(value) => updatePolicy("automationApprovalRequired", value)} />
              <PolicySwitch label="Export Limits Enforced" value={draft.policy.exportLimitsEnforced} onChange={(value) => updatePolicy("exportLimitsEnforced", value)} />
              <PolicySwitch label="Autonomous AI Disabled" value={draft.policy.autonomousAiDisabled} onChange={(value) => updatePolicy("autonomousAiDisabled", value)} />
            </div>
          </Section>

          <Section title="Module Access">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Control enabled modules for this tenant.</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAllModules(true)}>Select All</Button>
                <Button variant="outline" size="sm" onClick={() => setAllModules(false)}>Clear All</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {MODULES.map((module) => {
                const checked = draft.moduleAccess.find((item) => item.moduleKey === module.key)?.enabled ?? false;
                return (
                  <label key={module.key} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                    <span className="text-sm text-foreground">{module.label}</span>
                    <Checkbox checked={checked} onCheckedChange={(value) => updateModuleAccess(module.key, value === true)} />
                  </label>
                );
              })}
            </div>
          </Section>

          <Section title="Lifecycle">
            <div className="flex flex-wrap gap-2">
              <Button variant={draft.lifecycleStatus === "Active" ? "default" : "outline"} onClick={() => applyLifecycleStatus("Active")}>
                <PlayCircle className="h-4 w-4" /> Active
              </Button>
              <Button variant={draft.lifecycleStatus === "Suspended" ? "warning" : "outline"} onClick={() => applyLifecycleStatus("Suspended")}>
                <PauseCircle className="h-4 w-4" /> Suspend
              </Button>
              <Button variant={draft.lifecycleStatus === "Archived" ? "destructive-soft" : "outline"} onClick={() => applyLifecycleStatus("Archived")}>
                <Archive className="h-4 w-4" /> Archive
              </Button>
            </div>
          </Section>

          {feedback && (
            <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>{feedback}</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PolicySwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
      <p className="text-sm text-foreground">{label}</p>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
