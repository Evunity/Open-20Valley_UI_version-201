import {
  Server,
  Wifi,
  AlertCircle,
  Activity,
  Zap,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Clock,
  Signal,
  Shield,
  Gauge,
} from "lucide-react";
import type { ReactNode } from "react";

export interface KPIDefinition {
  id: string;
  label: string;
  icon: ReactNode;
  unit: string;
  description: string;
  defaultValue?: string | number;
}

export const AVAILABLE_KPIS: KPIDefinition[] = [
  {
    id: "total_sites",
    label: "Total Sites",
    icon: <Server className="w-5 h-5" />,
    unit: "count",
    description: "Total operational sites across the network",
    defaultValue: "2,847",
  },
  {
    id: "active_sites",
    label: "Active Sites",
    icon: <Wifi className="w-5 h-5" />,
    unit: "count",
    description: "Currently active and operational sites",
    defaultValue: "2,721",
  },
  {
    id: "down_sites",
    label: "Down Sites",
    icon: <AlertCircle className="w-5 h-5" />,
    unit: "count",
    description: "Sites currently offline or unavailable",
    defaultValue: "126",
  },
  {
    id: "uptime",
    label: "Uptime",
    icon: <Activity className="w-5 h-5" />,
    unit: "%",
    description: "Network availability percentage",
    defaultValue: "99.87%",
  },
  {
    id: "avg_latency",
    label: "Avg Latency",
    icon: <Zap className="w-5 h-5" />,
    unit: "ms",
    description: "Average network response time",
    defaultValue: "42ms",
  },
  {
    id: "success_rate",
    label: "Success Rate",
    icon: <CheckCircle2 className="w-5 h-5" />,
    unit: "%",
    description: "Percentage of successful transactions",
    defaultValue: "98.9%",
  },
  {
    id: "packet_loss",
    label: "Packet Loss",
    icon: <TrendingUp className="w-5 h-5" />,
    unit: "%",
    description: "Data packet loss rate across the network",
    defaultValue: "0.12%",
  },
  {
    id: "network_availability",
    label: "Network Availability",
    icon: <Signal className="w-5 h-5" />,
    unit: "%",
    description: "Overall network infrastructure availability",
    defaultValue: "99.92%",
  },
  {
    id: "call_completion_rate",
    label: "Call Completion Rate",
    icon: <BarChart3 className="w-5 h-5" />,
    unit: "%",
    description: "Percentage of calls completed successfully",
    defaultValue: "97.45%",
  },
  {
    id: "data_throughput",
    label: "Data Throughput",
    icon: <Clock className="w-5 h-5" />,
    unit: "Tbps",
    description: "Data transfer rate across the network",
    defaultValue: "3.42",
  },
  {
    id: "incident_count",
    label: "Incident Count",
    icon: <Shield className="w-5 h-5" />,
    unit: "count",
    description: "Number of active incidents detected",
    defaultValue: "12",
  },
  {
    id: "network_health",
    label: "Network Health Score",
    icon: <Gauge className="w-5 h-5" />,
    unit: "%",
    description: "Overall network health assessment score",
    defaultValue: "94.2%",
  },
];

// Create a map for easy lookup
export const KPI_MAP = new Map(AVAILABLE_KPIS.map((kpi) => [kpi.id, kpi]));

// Get KPI by ID
export const getKPIById = (id: string): KPIDefinition | undefined => {
  return KPI_MAP.get(id);
};