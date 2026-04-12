import { useState, type ComponentType } from "react";
import { Building2, ClipboardList, FileCheck2, Shield, UserCog, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import TenantOverview from "@/components/access-control/TenantOverview";
import TenantProvisioning from "@/components/access-control/TenantProvisioning";

type AccessSubsectionId =
  | "tenant-overview"
  | "tenant-provisioning"
  | "users-identity"
  | "roles-permissions"
  | "security-policies"
  | "audit-trail";

interface AccessSubsection {
  id: AccessSubsectionId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
}

const SUBSECTIONS: AccessSubsection[] = [
  {
    id: "tenant-overview",
    label: "Tenant Overview",
    icon: Building2,
    description: "Tenant topology and enterprise summary",
  },
  {
    id: "tenant-provisioning",
    label: "Tenant Provisioning",
    icon: ClipboardList,
    description: "Provision and onboard new tenants",
  },
  {
    id: "users-identity",
    label: "Users & Identity",
    icon: Users,
    description: "User lifecycle and identity controls",
  },
  {
    id: "roles-permissions",
    label: "Roles & Permissions",
    icon: UserCog,
    description: "Role modeling and permission assignment",
  },
  {
    id: "security-policies",
    label: "Security Policies",
    icon: Shield,
    description: "Policy governance and enforcement",
  },
  {
    id: "audit-trail",
    label: "Audit Trail",
    icon: FileCheck2,
    description: "Traceability and evidence logs",
  },
];

export default function AccessControl() {
  const [activeSubsection, setActiveSubsection] = useState<AccessSubsectionId>("tenant-overview");

  const activeMeta = SUBSECTIONS.find((section) => section.id === activeSubsection);

  const renderSubsection = () => {
    switch (activeSubsection) {
      case "tenant-overview":
        return <TenantOverview />;
      case "tenant-provisioning":
        return <TenantProvisioning />;
      case "users-identity":
      case "roles-permissions":
      case "security-policies":
      case "audit-trail":
        return (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-base font-semibold text-foreground">{activeMeta?.label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This subsection is reserved and intentionally scoped for the Access Control IA set.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full min-h-0 w-full min-w-0 bg-background flex flex-col overflow-hidden">
      <div className="border-b border-border bg-card/50 px-4 py-3">
        <div className="grid grid-cols-1 gap-2 auto-rows-max md:grid-cols-2 xl:grid-cols-6">
          {SUBSECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSubsection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSubsection(section.id)}
                className={cn(
                  "flex min-h-[86px] flex-col items-start justify-center gap-1 rounded-lg border p-3 text-left transition",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                )}
                title={section.description}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-semibold tracking-wide">{section.label}</span>
                </div>
                <span className={cn("line-clamp-2 text-[11px]", isActive ? "text-primary/90" : "text-muted-foreground")}>
                  {section.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">{renderSubsection()}</div>
    </div>
  );
}
