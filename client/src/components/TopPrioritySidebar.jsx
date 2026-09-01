import { useFirestoreTopPriority } from "../hooks/useFirestoreIncidents";
import { TAG_ICONS, getSeverityColor, STATUS_COLORS } from "../utils/severityColors";

function hasValidLocation(i) {
  return (
    i.centerLocation != null &&
    typeof i.centerLocation.lat === "number" &&
    typeof i.centerLocation.lng === "number"
  );
}

export default function TopPrioritySidebar({ limit = 3, onSelectIncident, className }) {
  const { incidents, loading } = useFirestoreTopPriority(limit * 2);

  const validIncidents = incidents
    .filter(hasValidLocation)
    .slice(0, limit);

  return (
    <div className={`rounded-xl bg-[#0f2337]/95 backdrop-blur-sm border border-white/[0.08] p-3 ${className ?? ""}`}>
      <h3 className="text-[11px] font-semibold text-white/80 mb-3">
        Top {limit} priority incidents
      </h3>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : validIncidents.length === 0 ? (
        <p className="text-[11px] text-white/30">No active incidents</p>
      ) : (
        <div className="space-y-1.5">
          {validIncidents.map((incident) => (
            <IncidentEntry
              key={incident.id}
              incident={incident}
              onClick={() =>
                onSelectIncident?.({
                  id: incident.id,
                  centerLocation: incident.centerLocation,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IncidentEntry({ incident, onClick }) {
  const severityColor = getSeverityColor(incident.priorityScore);
  const icon = TAG_ICONS[incident.primaryTag] || "📍";
  const statusColor = STATUS_COLORS[incident.status] || "#888";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-left group"
    >
      <span className="text-base leading-none mt-0.5 shrink-0">{icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-semibold text-white/90 capitalize truncate">
            {incident.primaryTag}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold tabular-nums shrink-0"
            style={{
              color: severityColor,
              backgroundColor: `${severityColor}20`,
              border: `1px solid ${severityColor}40`,
            }}
          >
            {incident.priorityScore}
          </span>
        </div>

        <p className="text-[10px] text-white/40 leading-snug truncate">
          {incident.severitySummary}
        </p>

        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-[9px] text-white/30 capitalize">
            {(incident.status || "unknown").replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </button>
  );
}