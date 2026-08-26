// severityColors.js
// Single source of truth for how "severity" maps to color across the map UI
// (markers, heatmap, legend, popups). Keeping this in one file means the
// legend can never drift out of sync with what the markers actually show.
//
// Severity is assumed to be a 0-100 score coming from the AI Prioritization
// Agent (Member 3). Adjust BANDS if their scale differs.

export const SEVERITY_BANDS = [
  { max: 25, label: "Low", color: "#22c55e" },      // green
  { max: 50, label: "Moderate", color: "#eab308" },  // yellow
  { max: 75, label: "High", color: "#f97316" },      // orange
  { max: 101, label: "Critical", color: "#ef4444" }, // red
];

export function getSeverityColor(severity = 0) {
  const band = SEVERITY_BANDS.find((b) => severity < b.max);
  return band ? band.color : SEVERITY_BANDS[SEVERITY_BANDS.length - 1].color;
}

export function getSeverityLabel(severity = 0) {
  const band = SEVERITY_BANDS.find((b) => severity < b.max);
  return band ? band.label : "Unknown";
}

// Radius (in px) for a cluster marker, scaled by how many reports are in it.
// Floors/ceilings keep single-report incidents visible and mega-clusters
// from swallowing the map.
export function getClusterRadius(reportCount = 1) {
  const min = 8;
  const max = 32;
  const scaled = min + Math.sqrt(reportCount) * 4;
  return Math.min(max, Math.max(min, scaled));
}

// Normalized 0-1 intensity value for leaflet.heat, which expects [lat, lng, intensity]
export function getHeatIntensity(severity = 0) {
  return Math.min(1, Math.max(0.1, severity / 100));
}