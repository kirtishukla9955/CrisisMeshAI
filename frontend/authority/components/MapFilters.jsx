// MapFilters.jsx
// Controls panel for filtering what's shown on the map: incident type,
// minimum severity, and time range. Lifts state up to CrisisMap via
// onChange so filtering logic lives in one place.

// frontend/authority/components/MapFilters.jsx
import React from "react";

export const INCIDENT_TYPES = ["flood", "earthquake", "cyclone", "landslide"];
export const TIME_RANGES = [
  { value: "1h", label: "Last hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "all", label: "All time" },
];

export const DEFAULT_MAP_FILTERS = {
  types: [...INCIDENT_TYPES],
  minSeverity: 0,
  timeRange: "24h",
};

export default function MapFilters({ filters = {}, onChange, onFilterChange }) {
  // Support both 'onChange' and 'onFilterChange' prop naming
  const handleChange = onChange || onFilterChange;

  // Safe destructuring with fallbacks to prevent undefined crashes
  const types = Array.isArray(filters.types) ? filters.types : DEFAULT_MAP_FILTERS.types;
  const minSeverity = typeof filters.minSeverity === "number" ? filters.minSeverity : 0;
  const timeRange = filters.timeRange || "24h";

  function toggleType(type) {
    const next = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type];
    handleChange?.({ ...filters, types: next, minSeverity, timeRange });
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md p-3 w-56 space-y-3 text-sm">
      <div>
        <div className="font-semibold text-gray-700 mb-1.5">Incident type</div>
        <div className="flex flex-wrap gap-1.5">
          {INCIDENT_TYPES.map((type) => {
            const isActive = types.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`px-2 py-1 rounded-full text-xs capitalize border transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {type}
              </button>
            );
          })}
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
            handleChange?.({ ...filters, minSeverity: Number(e.target.value), types, timeRange })
          }
          className="w-full cursor-pointer"
        />
      </div>

      <div>
        <div className="font-semibold text-gray-700 mb-1.5">Time range</div>
        <select
          value={timeRange}
          onChange={(e) => 
            handleChange?.({ ...filters, timeRange: e.target.value, types, minSeverity })
          }
          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
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