/**
 * Health Score Calculations
 * Generates composite health scores for Network, Voice, Data, and Availability
 */

export interface HealthScoreCard {
  label: string;
  score: number; // 0-100
  status: "healthy" | "acceptable" | "degraded" | "critical";
  trend: "improving" | "stable" | "degrading"; // vs previous period
  trendValue: number; // percentage change
  description: string;
  tooltip: string;
}

export interface HealthSummary {
  networkPerformance: HealthScoreCard;
  voiceQuality: HealthScoreCard;
  dataExperience: HealthScoreCard;
  availability: HealthScoreCard;
  overallScore: number;
}

/**
 * Determine status color based on score
 */
const getStatusFromScore = (score: number): "healthy" | "acceptable" | "degraded" | "critical" => {
  if (score >= 90) return "healthy";
  if (score >= 80) return "acceptable";
  if (score >= 70) return "degraded";
  return "critical";
};

/**
 * Determine trend based on change value
 */
const getTrendFromChange = (change: number): "improving" | "stable" | "degrading" => {
  if (Math.abs(change) < 0.5) return "stable";
  return change > 0 ? "improving" : "degrading";
};

/**
 * Calculate Network Performance Score
 * Factors: Call Success Rate, Drop Rate, Availability
 */
export const calculateNetworkPerformanceScore = (metrics: {
  callSuccessRate?: number; // 0-100
  dropRate?: number; // 0-100 (lower is better)
  availability?: number; // 0-100
}): HealthScoreCard => {
  const callSuccessRate = metrics.callSuccessRate ?? 96.5;
  const dropRate = metrics.dropRate ?? 2.1;
  const availability = metrics.availability ?? 99.2;

  // Weighted calculation
  const score = (callSuccessRate * 0.4 + (100 - dropRate) * 0.3 + availability * 0.3);
  const previousScore = score - (Math.random() - 0.5) * 5; // Simulate previous period
  const change = score - previousScore;

  return {
    label: "Network Performance",
    score: Math.round(score),
    status: getStatusFromScore(score),
    trend: getTrendFromChange(change),
    trendValue: Math.round(change * 10) / 10,
    description: `Based on call success rate, drop rate, and availability metrics.`,
    tooltip: `Network Performance Score combines call success rate (${callSuccessRate.toFixed(1)}%), drop rate (${dropRate.toFixed(1)}%), and availability (${availability.toFixed(1)}%). The score reflects overall network stability and reliability.`,
  };
};

/**
 * Calculate Voice Quality Score
 * Factors: VQI, CSFB Success Rate, Handover Success Rate
 */
export const calculateVoiceQualityScore = (metrics: {
  vqi?: number; // 1-5 scale, convert to 0-100
  csfbSuccessRate?: number; // 0-100
  handoverSuccessRate?: number; // 0-100
}): HealthScoreCard => {
  const vqi = (metrics.vqi ?? 4.2) / 5 * 100;
  const csfbSuccessRate = metrics.csfbSuccessRate ?? 98.5;
  const handoverSuccessRate = metrics.handoverSuccessRate ?? 97.8;

  // Weighted calculation
  const score = (vqi * 0.4 + csfbSuccessRate * 0.3 + handoverSuccessRate * 0.3);
  const previousScore = score - (Math.random() - 0.5) * 3;
  const change = score - previousScore;

  return {
    label: "Voice Quality",
    score: Math.round(score),
    status: getStatusFromScore(score),
    trend: getTrendFromChange(change),
    trendValue: Math.round(change * 10) / 10,
    description: `Measured by voice quality index, circuit-switched fallback, and handover success.`,
    tooltip: `Voice Quality Score reflects VQI (${metrics.vqi?.toFixed(1) ?? '4.2'}/5), CSFB success rate (${csfbSuccessRate.toFixed(1)}%), and handover success rate (${handoverSuccessRate.toFixed(1)}%). Higher scores indicate better voice call experience.`,
  };
};

/**
 * Calculate Data Experience Score
 * Factors: Throughput, Latency, Packet Loss
 */
export const calculateDataExperienceScore = (metrics: {
  avgThroughput?: number; // Mbps, normalize to 0-100
  avgLatency?: number; // ms, lower is better (normalize to 0-100)
  packetLoss?: number; // %, lower is better
}): HealthScoreCard => {
  // Normalize metrics to 0-100 scale
  const throughput = Math.min((metrics.avgThroughput ?? 50) / 100 * 100, 100);
  const latency = Math.max(0, 100 - (metrics.avgLatency ?? 50) / 2); // Lower latency is better
  const packetLoss = Math.max(0, 100 - (metrics.packetLoss ?? 1) * 10);

  // Weighted calculation
  const score = (throughput * 0.4 + latency * 0.35 + packetLoss * 0.25);
  const previousScore = score - (Math.random() - 0.5) * 4;
  const change = score - previousScore;

  return {
    label: "Data Experience",
    score: Math.round(score),
    status: getStatusFromScore(score),
    trend: getTrendFromChange(change),
    trendValue: Math.round(change * 10) / 10,
    description: `Determined by throughput, latency, and packet loss metrics.`,
    tooltip: `Data Experience Score is based on average throughput (${metrics.avgThroughput?.toFixed(1) ?? '50'} Mbps), latency (${metrics.avgLatency?.toFixed(1) ?? '50'} ms), and packet loss (${metrics.packetLoss?.toFixed(2) ?? '1'}%). Higher scores indicate better data experience.`,
  };
};

/**
 * Calculate Availability Score
 * Factors: Network Uptime, Service Availability, SLA Compliance
 */
export const calculateAvailabilityScore = (metrics: {
  networkUptime?: number; // 0-100
  serviceAvailability?: number; // 0-100
  slaCompliance?: number; // 0-100
}): HealthScoreCard => {
  const networkUptime = metrics.networkUptime ?? 99.85;
  const serviceAvailability = metrics.serviceAvailability ?? 99.5;
  const slaCompliance = metrics.slaCompliance ?? 99.2;

  // Weighted calculation
  const score = (networkUptime * 0.4 + serviceAvailability * 0.35 + slaCompliance * 0.25);
  const previousScore = score - (Math.random() - 0.5) * 2;
  const change = score - previousScore;

  return {
    label: "Availability",
    score: Math.round(score),
    status: getStatusFromScore(score),
    trend: getTrendFromChange(change),
    trendValue: Math.round(change * 10) / 10,
    description: `Reflects network uptime, service availability, and SLA compliance.`,
    tooltip: `Availability Score combines network uptime (${networkUptime.toFixed(2)}%), service availability (${serviceAvailability.toFixed(2)}%), and SLA compliance (${slaCompliance.toFixed(2)}%). This metric indicates overall reliability and compliance with service level agreements.`,
  };
};

/**
 * Generate complete health summary
 */
export const generateHealthSummary = (metrics?: {
  callSuccessRate?: number;
  dropRate?: number;
  networkUptime?: number;
  vqi?: number;
  csfbSuccessRate?: number;
  handoverSuccessRate?: number;
  avgThroughput?: number;
  avgLatency?: number;
  packetLoss?: number;
  serviceAvailability?: number;
  slaCompliance?: number;
}): HealthSummary => {
  const networkCard = calculateNetworkPerformanceScore({
    callSuccessRate: metrics?.callSuccessRate,
    dropRate: metrics?.dropRate,
    availability: metrics?.networkUptime,
  });

  const voiceCard = calculateVoiceQualityScore({
    vqi: metrics?.vqi,
    csfbSuccessRate: metrics?.csfbSuccessRate,
    handoverSuccessRate: metrics?.handoverSuccessRate,
  });

  const dataCard = calculateDataExperienceScore({
    avgThroughput: metrics?.avgThroughput,
    avgLatency: metrics?.avgLatency,
    packetLoss: metrics?.packetLoss,
  });

  const availabilityCard = calculateAvailabilityScore({
    networkUptime: metrics?.networkUptime,
    serviceAvailability: metrics?.serviceAvailability,
    slaCompliance: metrics?.slaCompliance,
  });

  const overallScore = Math.round(
    (networkCard.score + voiceCard.score + dataCard.score + availabilityCard.score) / 4
  );

  return {
    networkPerformance: networkCard,
    voiceQuality: voiceCard,
    dataExperience: dataCard,
    availability: availabilityCard,
    overallScore,
  };
};

/**
 * Get color for status
 */
export const getStatusColor = (
  status: "healthy" | "acceptable" | "degraded" | "critical"
): string => {
  switch (status) {
    case "healthy":
      return "bg-green-100 text-green-900";
    case "acceptable":
      return "bg-blue-100 text-blue-900";
    case "degraded":
      return "bg-orange-100 text-orange-900";
    case "critical":
      return "bg-red-100 text-red-900";
    default:
      return "bg-gray-100 text-gray-900";
  }
};

/**
 * Get color for trend
 */
export const getTrendColor = (trend: "improving" | "stable" | "degrading"): string => {
  switch (trend) {
    case "improving":
      return "text-green-600";
    case "stable":
      return "text-gray-600";
    case "degrading":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
