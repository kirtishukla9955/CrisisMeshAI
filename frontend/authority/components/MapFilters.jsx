// MapFilters.jsx
// Controls panel for filtering what's shown on the map: incident type,
// minimum severity, and time range. Lifts state up to CrisisMap via
// onChange so filtering logic lives in one place.

const INCIDENT_TYPES = ["flood", "earthquake", "cyclone", "landslide"];
const TIME_RANGES = [
  { value: "1h", label: "Last hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "all", label: "All time" },
];

export default function MapFilters({ filters, onChange }) {
  const { types, minSeverity, timeRange } = filters;

  function toggleType(type) {
    const next = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type];
    onChange({ ...filters, types: next });
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md p-3 w-56 space-y-3 text-sm">
      <div>
        <div className="font-semibold text-gray-700 mb-1.5">Incident type</div>
        <div className="flex flex-wrap gap-1.5">
          {INCIDENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-2 py-1 rounded-full text-xs capitalize border transition-colors ${
                types.includes(type)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-semibold text-gray-700 mb-1.5">
          Min. severity: {minSeverity}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={minSeverity}
          onChange={(e) =>
            onChange({ ...filters, minSeverity: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <div className="font-semibold text-gray-700 mb-1.5">Time range</div>
        <select
          value={timeRange}
          onChange={(e) => onChange({ ...filters, timeRange: e.target.value })}
          className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
        >
          {TIME_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export const DEFAULT_MAP_FILTERS = {
  types: [...INCIDENT_TYPES],
  minSeverity: 0,
  timeRange: "24h",
};
