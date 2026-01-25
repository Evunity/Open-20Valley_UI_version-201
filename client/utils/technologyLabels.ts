/**
 * Utility functions for consistent technology label display across the application
 * This ensures clear and consistent labeling of network technologies (5G, 4G, 3G, 2G, O-RAN)
 */

export type Technology = "2G" | "3G" | "4G" | "5G" | "O-RAN";

// Technology label descriptions for clarity
export const TECHNOLOGY_LABELS: Record<Technology, { label: string; description: string; color: string }> = {
  "2G": {
    label: "2G",
    description: "2nd Generation (GSM)",
    color: "#ef4444", // red
  },
  "3G": {
    label: "3G",
    description: "3rd Generation (UMTS/WCDMA)",
    color: "#f59e0b", // amber
  },
  "4G": {
    label: "4G",
    description: "4th Generation (LTE)",
    color: "#3b82f6", // blue
  },
  "5G": {
    label: "5G",
    description: "5th Generation (NR)",
    color: "#10b981", // green
  },
  "O-RAN": {
    label: "O-RAN",
    description: "Open Radio Access Network",
    color: "#8b5cf6", // purple
  },
};

/**
 * Get the full technology label with description
 * @param tech - Technology identifier (2G, 3G, 4G, 5G, O-RAN)
 * @returns Object with label, description, and color
 */
export function getTechnologyLabel(tech: string): { label: string; description: string; color: string } {
  const key = tech.toUpperCase() as Technology;
  return TECHNOLOGY_LABELS[key] || {
    label: tech,
    description: "Unknown technology",
    color: "#6b7280",
  };
}

/**
 * Get display label for technology (e.g., "5G (5th Generation NR)")
 * @param tech - Technology identifier
 * @param includeDescription - Whether to include the description
 * @returns Formatted label string
 */
export function formatTechnologyLabel(tech: string, includeDescription = false): string {
  const techInfo = getTechnologyLabel(tech);
  if (includeDescription) {
    return `${techInfo.label} (${techInfo.description})`;
  }
  return techInfo.label;
}

/**
 * Get color for technology visualization
 * @param tech - Technology identifier
 * @returns Hex color code
 */
export function getTechnologyColor(tech: string): string {
  return getTechnologyLabel(tech).color;
}

/**
 * Normalize technology input to standard format
 * @param tech - Technology identifier (may have variations)
 * @returns Normalized technology string
 */
export function normalizeTechnology(tech: string): Technology | string {
  const normalized = tech.toUpperCase().trim();
  // Handle common variations
  switch (normalized) {
    case "GSM":
      return "2G";
    case "UMTS":
    case "WCDMA":
      return "3G";
    case "LTE":
      return "4G";
    case "NR":
      return "5G";
    case "ORAN":
    case "O_RAN":
      return "O-RAN";
    default:
      return tech; // Return as-is if not a known variation
  }
}

/**
 * Sort technologies in logical order (older to newer, O-RAN last)
 * @param technologies - Array of technology identifiers
 * @returns Sorted array
 */
export function sortTechnologies(technologies: string[]): string[] {
  const order: Record<string, number> = {
    "2G": 1,
    "3G": 2,
    "4G": 3,
    "5G": 4,
    "O-RAN": 5,
  };

  return [...technologies].sort((a, b) => {
    const aOrder = order[a.toUpperCase()] || 999;
    const bOrder = order[b.toUpperCase()] || 999;
    return aOrder - bOrder;
  });
}

/**
 * Check if string is a valid technology
 * @param tech - Technology identifier to validate
 * @returns true if valid technology
 */
export function isValidTechnology(tech: string): tech is Technology {
  return tech.toUpperCase() in TECHNOLOGY_LABELS;
}

/**
 * Get all available technologies
 * @returns Array of all technology keys
 */
export function getAllTechnologies(): Technology[] {
  return Object.keys(TECHNOLOGY_LABELS) as Technology[];
}

/**
 * Create technology description for mixed environment displays
 * @param technologies - Array of selected technologies
 * @returns Human-readable string
 */
export function describeMixedTechnologies(technologies: string[]): string {
  if (technologies.length === 0) {
    return "All technologies";
  }
  if (technologies.length === 1) {
    return `${getTechnologyLabel(technologies[0]).label}`;
  }
  const sorted = sortTechnologies(technologies);
  return sorted.join(", ");
}
