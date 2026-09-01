export const SEVERITY_COLORS = {
  critical: "#C0392B",
  high: "#E67E22",
  moderate: "#F1C40F",
};

export const STATUS_COLORS = {
  new: "#C0392B",
  acknowledged: "#E67E22",
  in_progress: "#3498DB",
  resolved: "#27AE60",
};

export const TAG_ICONS = {
  flood: "🌊",
  fire: "🔥",
  medical: "🏥",
  injury: "🩹",
  shelter: "⛺",
  evacuation: "🚨",
  infrastructure: "🏗️",
  rescue: "🚑",
  cyclone: "🌀",
  landslide: "⛰️",
};

export function getSeverityColor(score) {
  if (score >= 80) return SEVERITY_COLORS.critical;
  if (score >= 50) return SEVERITY_COLORS.high;
  return SEVERITY_COLORS.moderate;
}

export function getSeverityLabel(score) {
  if (score >= 80) return "critical";
  if (score >= 50) return "high";
  return "moderate";
}

export function getSeverityRadius(score) {
  if (score >= 80) return 20;
  if (score >= 50) return 15;
  return 11;
}