// ClusterPopup.jsx
// Content rendered inside the Leaflet Popup for a single incident cluster.
// Kept as a plain component (not tied to react-leaflet) so it can also be
// reused in a sidebar/detail panel later if the team wants that.

import { getSeverityColor, getSeverityLabel } from "../utils/severityColors";

export default function ClusterPopup({ cluster }) {
  const {
    type = "Unknown",
    severity = 0,
    reportCount = 1,
    affectedEstimate,
    blockedRoads,
    priorityScore,
    timestamp,
  } = cluster;

  const color = getSeverityColor(severity);
  const label = getSeverityLabel(severity);
  const time = timestamp ? new Date(timestamp).toLocaleString() : "Unknown time";

  return (
    <div className="text-sm space-y-1.5 min-w-[200px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold capitalize">{type}</span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
      </div>

      <div className="text-gray-600">
        <span className="font-medium">{reportCount}</span> report
        {reportCount === 1 ? "" : "s"} in this cluster
      </div>

      {typeof affectedEstimate === "number" && (
        <div className="text-gray-600">
          Est. affected: <span className="font-medium">{affectedEstimate}</span>
        </div>
      )}

      {blockedRoads?.length > 0 && (
        <div className="text-gray-600">
          Blocked roads:{" "}
          <span className="font-medium">{blockedRoads.join(", ")}</span>
        </div>
      )}

      {typeof priorityScore === "number" && (
        <div className="text-gray-600">
          Priority score: <span className="font-medium">{priorityScore}</span>
        </div>
      )}

      <div className="text-xs text-gray-400 pt-1 border-t border-gray-100 mt-1">
        Last updated: {time}
      </div>
    </div>
  );
}
