import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Archive, Plus, Save, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TenantStatus = "Active" | "Suspended" | "Archived";

type TenantProvisioningModel = {
  id: string;
  tenantName: string;
  country: string;
  timezone: string;
  organizationType: string;
  dataRetentionPolicy: string;
  securityLevel: string;
  allowedEmailDomains: string[];
  ipAllowlist: string[];
  regulatoryProfile: string;
  inheritedFrom: string;
  policies: {
    mfaRequired: boolean;
    automationApprovalRequired: boolean;
    exportLimitsEnforced: boolean;
    autonomousAiDisabled: boolean;
  };
  status: TenantStatus;
};

const STORAGE_KEY = "tenant_provisioning_store_v1";

const DEFAULT_TENANTS: TenantProvisioningModel[] = [
  {
    id: "telecom-group",
    tenantName: "Telecom Group",
    country: "Global",
    timezone: "UTC",
    organizationType: "Parent Group",
    dataRetentionPolicy: "24 Months",
    securityLevel: "Critical",
    allowedEmailDomains: ["telecom-group.com"],
    ipAllowlist: ["10.0.0.0/16"],
    regulatoryProfile: "NIST + ISO27001",
    inheritedFrom: "Root",
    policies: {
      mfaRequired: true,
      automationApprovalRequired: true,
      exportLimitsEnforced: true,
      autonomousAiDisabled: false,
    },
    status: "Active",
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
    ipAllowlist: ["10.20.0.0/16", "172.20.10.12/32"],
    regulatoryProfile: "NTRA + GDPR",
    inheritedFrom: "Telecom Group (Parent)",
    policies: {
      mfaRequired: true,
      automationApprovalRequired: true,
      exportLimitsEnforced: true,
      autonomousAiDisabled: false,
    },
    status: "Active",
  },
];

const COUNTRIES = ["Egypt", "Saudi Arabia", "UAE", "Global"];
const TIMEZONES = ["Africa/Cairo", "Asia/Riyadh", "Asia/Dubai", "UTC"];
const ORG_TYPES = ["Operator", "Managed Services", "Enterprise", "Parent Group"];
const RETENTION = ["6 Months", "12 Months", "24 Months", "36 Months"];
const SECURITY_LEVELS = ["Medium", "High", "Critical"];
const REGULATORY_PROFILES = ["NTRA + GDPR", "CST + ISO27001", "NIST + ISO27001", "Custom"];

const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const ipOrCidrRegex = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})(?:\/(?:[0-9]|[12][0-9]|3[0-2]))?$/;

export default function TenantProvisioning() {
  const [tenants, setTenants] = useState<TenantProvisioningModel[]>(DEFAULT_TENANTS);
  const [selectedTenantId, setSelectedTenantId] = useState(DEFAULT_TENANTS[1].id);
  const [savedModel, setSavedModel] = useState<TenantProvisioningModel>(DEFAULT_TENANTS[1]);
  const [form, setForm] = useState<TenantProvisioningModel>(DEFAULT_TENANTS[1]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailInput, setEmailInput] = useState("");
  const [ipInput, setIpInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as TenantProvisioningModel[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setTenants(parsed);
      const existing = parsed.find((t) => t.id === selectedTenantId) ?? parsed[0];
      setSelectedTenantId(existing.id);
      setSavedModel(existing);
      setForm(existing);
    } catch {
      // keep defaults if parsing fails
    }
  }, [selectedTenantId]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedModel), [form, savedModel]);

  const activeStatusClass =
    form.status === "Active"
      ? "bg-green-500/15 text-green-700 dark:text-green-300"
      : form.status === "Suspended"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-red-500/15 text-red-700 dark:text-red-300";

  const updateField = <K extends keyof TenantProvisioningModel>(field: K, value: TenantProvisioningModel[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  };

  const updatePolicy = (key: keyof TenantProvisioningModel["policies"], value: boolean) => {
    setForm((prev) => ({ ...prev, policies: { ...prev.policies, [key]: value } }));
    setFeedback(null);
  };

  const loadTenant = (tenantId: string) => {
    const found = tenants.find((t) => t.id === tenantId);
    if (!found) return;
    setSelectedTenantId(tenantId);
    setSavedModel(found);
    setForm(found);
    setErrors({});
    setFeedback(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.tenantName.trim()) next.tenantName = "Tenant Name is required.";
    if (!form.country) next.country = "Country is required.";
    if (!form.timezone) next.timezone = "Timezone is required.";
    if (!form.organizationType) next.organizationType = "Organization Type is required.";
    if (!form.dataRetentionPolicy) next.dataRetentionPolicy = "Data Retention Policy is required.";
    if (!form.securityLevel) next.securityLevel = "Security Level is required.";

    form.allowedEmailDomains.forEach((domain) => {
      if (!domainRegex.test(domain)) next.allowedEmailDomains = `Invalid domain: ${domain}`;
    });
    form.ipAllowlist.forEach((ip) => {
      if (!ipOrCidrRegex.test(ip)) next.ipAllowlist = `Invalid IP/CIDR: ${ip}`;
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const persist = (nextTenants: TenantProvisioningModel[], updated: TenantProvisioningModel) => {
    setTenants(nextTenants);
    setSavedModel(updated);
    setForm(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTenants));
  };

  const onSaveTenant = () => {
    if (!validate()) {
      setFeedback("Please fix validation errors before saving.");
      return;
    }

    const updated = { ...form };
    const nextTenants = tenants.map((tenant) => (tenant.id === updated.id ? updated : tenant));
    persist(nextTenants, updated);
    setFeedback("Tenant settings saved successfully.");
  };

  const onCancel = () => {
    setForm(savedModel);
    setErrors({});
    setFeedback("Unsaved changes were reverted.");
  };

  const applyLifecycleAction = (nextStatus: TenantStatus) => {
    if (nextStatus === form.status) return;
    const confirmed = window.confirm(`Are you sure you want to set tenant status to ${nextStatus}?`);
    if (!confirmed) return;

    const updated = { ...form, status: nextStatus };
    const nextTenants = tenants.map((tenant) => (tenant.id === updated.id ? updated : tenant));
    persist(nextTenants, updated);
    setFeedback(`Tenant status changed to ${nextStatus}.`);
  };

  const addDomain = () => {
    const value = emailInput.trim().toLowerCase();
    if (!value) return;
    if (!domainRegex.test(value)) {
      setErrors((prev) => ({ ...prev, allowedEmailDomains: "Please enter a valid domain." }));
      return;
    }
    if (form.allowedEmailDomains.includes(value)) return;
    updateField("allowedEmailDomains", [...form.allowedEmailDomains, value]);
    setEmailInput("");
    setErrors((prev) => ({ ...prev, allowedEmailDomains: "" }));
  };

  const addIp = () => {
    const value = ipInput.trim();
    if (!value) return;
    if (!ipOrCidrRegex.test(value)) {
      setErrors((prev) => ({ ...prev, ipAllowlist: "Please enter a valid IP or CIDR." }));
      return;
    }
    if (form.ipAllowlist.includes(value)) return;
    updateField("ipAllowlist", [...form.ipAllowlist, value]);
    setIpInput("");
    setErrors((prev) => ({ ...prev, ipAllowlist: "" }));
  };

  const removeDomain = (domain: string) => updateField("allowedEmailDomains", form.allowedEmailDomains.filter((d) => d !== domain));
  const removeIp = (ip: string) => updateField("ipAllowlist", form.ipAllowlist.filter((d) => d !== ip));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="w-full max-w-xs">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tenant</label>
          <Select value={selectedTenantId} onValueChange={loadTenant}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>{tenant.tenantName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onCancel} disabled={!isDirty} className="h-10 rounded-md border border-input px-4 text-sm disabled:opacity-40">Cancel</button>
          <button onClick={onSaveTenant} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Save Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Required Information</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Tenant Name *" error={errors.tenantName}>
              <input value={form.tenantName} onChange={(e) => updateField("tenantName", e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </Field>
            <Field label="Country *" error={errors.country}>
              <Select value={form.country} onValueChange={(value) => updateField("country", value)}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>{COUNTRIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Timezone *" error={errors.timezone}>
              <Select value={form.timezone} onValueChange={(value) => updateField("timezone", value)}>
                <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>{TIMEZONES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Organization Type *" error={errors.organizationType}>
              <Select value={form.organizationType} onValueChange={(value) => updateField("organizationType", value)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{ORG_TYPES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Data Retention Policy *" error={errors.dataRetentionPolicy}>
              <Select value={form.dataRetentionPolicy} onValueChange={(value) => updateField("dataRetentionPolicy", value)}>
                <SelectTrigger><SelectValue placeholder="Select retention" /></SelectTrigger>
                <SelectContent>{RETENTION.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Security Level *" error={errors.securityLevel}>
              <Select value={form.securityLevel} onValueChange={(value) => updateField("securityLevel", value)}>
                <SelectTrigger><SelectValue placeholder="Select security level" /></SelectTrigger>
                <SelectContent>{SECURITY_LEVELS.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Optional Settings</h3>

            <Field label="Allowed Email Domains" error={errors.allowedEmailDomains}>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="example.com" className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm" />
                  <button onClick={addDomain} className="inline-flex h-9 items-center rounded-md border border-input px-2.5 text-sm"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.allowedEmailDomains.map((domain) => (
                    <Tag key={domain} label={domain} onRemove={() => removeDomain(domain)} />
                  ))}
                </div>
              </div>
            </Field>

            <Field label="IP Allowlist" error={errors.ipAllowlist}>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input value={ipInput} onChange={(e) => setIpInput(e.target.value)} placeholder="10.0.0.0/24" className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm" />
                  <button onClick={addIp} className="inline-flex h-9 items-center rounded-md border border-input px-2.5 text-sm"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.ipAllowlist.map((ip) => (
                    <Tag key={ip} label={ip} onRemove={() => removeIp(ip)} />
                  ))}
                </div>
              </div>
            </Field>

            <Field label="Regulatory Profile">
              <Select value={form.regulatoryProfile} onValueChange={(value) => updateField("regulatoryProfile", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REGULATORY_PROFILES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Policy Inheritance</h3>
            <p className="mt-1 text-xs text-muted-foreground">Inherited from: {form.inheritedFrom}</p>

            <div className="mt-3 space-y-3">
              <ToggleRow label="MFA Required" checked={form.policies.mfaRequired} onChange={(checked) => updatePolicy("mfaRequired", checked)} />
              <ToggleRow label="Automation Approval Required" checked={form.policies.automationApprovalRequired} onChange={(checked) => updatePolicy("automationApprovalRequired", checked)} />
              <ToggleRow label="Export Limits Enforced" checked={form.policies.exportLimitsEnforced} onChange={(checked) => updatePolicy("exportLimitsEnforced", checked)} />
              <ToggleRow label="Autonomous AI Disabled" checked={form.policies.autonomousAiDisabled} onChange={(checked) => updatePolicy("autonomousAiDisabled", checked)} />
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Tenant Lifecycle</h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Current Status</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", activeStatusClass)}>{form.status}</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => applyLifecycleAction("Suspended")} disabled={form.status !== "Active"} className="inline-flex h-9 items-center gap-1 rounded-md border border-amber-500/40 px-3 text-xs font-semibold text-amber-700 disabled:opacity-40">
              <ShieldAlert className="h-3.5 w-3.5" />
              Suspend
            </button>
            <button onClick={() => applyLifecycleAction("Archived")} disabled={form.status === "Archived"} className="inline-flex h-9 items-center gap-1 rounded-md border border-red-500/40 px-3 text-xs font-semibold text-red-700 disabled:opacity-40">
              <Archive className="h-3.5 w-3.5" />
              Archive
            </button>
          </div>
        </div>
      </section>

      {feedback && <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-foreground">{feedback}</div>}
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
      {label}
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-primary/20"><X className="h-3 w-3" /></button>
    </span>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-2.5 py-2">
      <span className="text-xs text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
