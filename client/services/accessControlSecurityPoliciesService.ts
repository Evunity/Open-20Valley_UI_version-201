export type EmergencyGuardrails = {
  globalAutomationKillSwitch: boolean;
  globalExportFreeze: boolean;
  emergencyReadOnlyMode: boolean;
};

export type SeparationOfDutiesRuleStatus = "Active" | "Inactive";

export type SeparationOfDutiesRule = {
  id: string;
  ruleText: string;
  actionA: string;
  actionB: string;
  status: SeparationOfDutiesRuleStatus;
};

export type TenantAwareApprovalStatus = "Awaiting" | "Approved" | "Denied";

export type TenantAwareApproval = {
  id: string;
  title: string;
  status: TenantAwareApprovalStatus;
  summary: string;
  detailText: string;
  createdAt: string;
  updatedAt?: string;
  tenantId?: string;
  requestedBy?: string;
  approvedBy?: string | null;
  approvalChain?: string[];
};

type SecurityPoliciesState = {
  emergencyGuardrails: EmergencyGuardrails;
  rules: SeparationOfDutiesRule[];
  approvals: TenantAwareApproval[];
};

const STORAGE_KEY = "access_control_security_policies_v1";

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_STATE: SecurityPoliciesState = {
  emergencyGuardrails: {
    globalAutomationKillSwitch: false,
    globalExportFreeze: false,
    emergencyReadOnlyMode: false,
  },
  rules: [
    {
      id: "rule-1",
      ruleText: "Cannot create and approve same automation",
      actionA: "Create Automation",
      actionB: "Approve Automation",
      status: "Active",
    },
    {
      id: "rule-2",
      ruleText: "Cannot modify and audit same policy",
      actionA: "Modify Policy",
      actionB: "Audit Policy",
      status: "Active",
    },
    {
      id: "rule-3",
      ruleText: "Cannot execute and approve own script",
      actionA: "Execute Script",
      actionB: "Approve Script",
      status: "Inactive",
    },
  ],
  approvals: [
    {
      id: "approval-1",
      title: "Cross-Tenant Operation",
      status: "Awaiting",
      summary: "Request to run multi-tenant topology sync",
      detailText: "Awaiting parent tenant approver sign-off before execution.",
      createdAt: "2026-04-10T08:20:00.000Z",
      tenantId: "telecom-group",
      requestedBy: "Alaa Hassan",
      approvedBy: null,
      approvalChain: ["Tenant Admin", "Security Officer", "Group Governance"],
    },
    {
      id: "approval-2",
      title: "Policy Override Request",
      status: "Approved",
      summary: "Temporary override for retention policy in Egypt Ops",
      detailText: "Approved for 24h under incident response exception.",
      createdAt: "2026-04-09T11:12:00.000Z",
      updatedAt: "2026-04-09T12:04:00.000Z",
      tenantId: "egypt-ops",
      requestedBy: "Mona Adel",
      approvedBy: "Nour Samir",
      approvalChain: ["Tenant Admin", "Compliance Lead"],
    },
    {
      id: "approval-3",
      title: "AI Model Deployment",
      status: "Denied",
      summary: "Deploy autonomous remediation model to KSA Ops",
      detailText: "Denied due to missing rollback playbook and model sign-off.",
      createdAt: "2026-04-08T14:05:00.000Z",
      updatedAt: "2026-04-08T16:10:00.000Z",
      tenantId: "ksa-ops",
      requestedBy: "Reem Khaled",
      approvedBy: "Security Council",
      approvalChain: ["Model Risk", "Security Officer", "Regional Director"],
    },
  ],
};

function loadState(): SecurityPoliciesState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as SecurityPoliciesState;
    if (!parsed.rules || !parsed.approvals || !parsed.emergencyGuardrails) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: SecurityPoliciesState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function getSecurityPolicies(): Promise<SecurityPoliciesState> {
  await delay();
  return loadState();
}

export async function patchEmergencyGuardrail(payload: {
  key: keyof EmergencyGuardrails;
  value: boolean;
  reason?: string;
}): Promise<EmergencyGuardrails> {
  await delay();
  if (!payload.reason?.trim()) throw new Error("Reason is required for emergency guardrail changes.");

  const state = loadState();
  state.emergencyGuardrails[payload.key] = payload.value;
  saveState(state);
  return state.emergencyGuardrails;
}

export async function exportSecurityPolicies(): Promise<string> {
  await delay();
  const state = loadState();
  return JSON.stringify(state, null, 2);
}

export async function createRule(payload: Omit<SeparationOfDutiesRule, "id">): Promise<SeparationOfDutiesRule> {
  await delay();
  const state = loadState();

  const actionA = payload.actionA.trim();
  const actionB = payload.actionB.trim();
  const ruleText = payload.ruleText.trim();

  if (!ruleText) throw new Error("Rule text is required.");
  if (!actionA || !actionB) throw new Error("Both actions are required.");
  if (actionA.toLowerCase() === actionB.toLowerCase()) throw new Error("Action A and Action B cannot be identical.");

  const pairExists = state.rules.some(
    (rule) =>
      [rule.actionA.toLowerCase(), rule.actionB.toLowerCase()].sort().join("|") ===
      [actionA.toLowerCase(), actionB.toLowerCase()].sort().join("|")
  );
  if (pairExists) throw new Error("A rule with the same action pair already exists.");

  const created: SeparationOfDutiesRule = {
    id: `rule-${Date.now()}`,
    ruleText,
    actionA,
    actionB,
    status: payload.status,
  };

  state.rules.unshift(created);
  saveState(state);
  return created;
}

export async function patchRule(ruleId: string, updates: Partial<Omit<SeparationOfDutiesRule, "id">>): Promise<SeparationOfDutiesRule> {
  await delay();
  const state = loadState();
  const idx = state.rules.findIndex((rule) => rule.id === ruleId);
  if (idx < 0) throw new Error("Rule not found.");

  const candidate = { ...state.rules[idx], ...updates };

  if (!candidate.ruleText.trim()) throw new Error("Rule text is required.");
  if (candidate.actionA.trim().toLowerCase() === candidate.actionB.trim().toLowerCase()) {
    throw new Error("Action A and Action B cannot be identical.");
  }

  const duplicate = state.rules.some(
    (rule, index) =>
      index !== idx &&
      [rule.actionA.toLowerCase(), rule.actionB.toLowerCase()].sort().join("|") ===
        [candidate.actionA.toLowerCase(), candidate.actionB.toLowerCase()].sort().join("|")
  );
  if (duplicate) throw new Error("A rule with the same action pair already exists.");

  state.rules[idx] = candidate;
  saveState(state);
  return candidate;
}

export async function deleteRule(ruleId: string): Promise<void> {
  await delay();
  const state = loadState();
  state.rules = state.rules.filter((rule) => rule.id !== ruleId);
  saveState(state);
}

export async function getApprovalById(approvalId: string): Promise<TenantAwareApproval> {
  await delay();
  const state = loadState();
  const found = state.approvals.find((approval) => approval.id === approvalId);
  if (!found) throw new Error("Approval item not found.");
  return found;
}

export async function patchApproval(
  approvalId: string,
  updates: Partial<Omit<TenantAwareApproval, "id">>
): Promise<TenantAwareApproval> {
  await delay();
  const state = loadState();
  const idx = state.approvals.findIndex((approval) => approval.id === approvalId);
  if (idx < 0) throw new Error("Approval item not found.");

  state.approvals[idx] = {
    ...state.approvals[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveState(state);
  return state.approvals[idx];
}
