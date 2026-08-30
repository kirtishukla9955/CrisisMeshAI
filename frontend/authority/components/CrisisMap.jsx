// CrisisMap.jsx
// Top-level Live Crisis Map: renders the Leaflet map, heatmap layer,
// per-cluster markers, filters panel, and legend. Owns filter state and
// derives the filtered cluster list passed down to children.
//
// npm install react-leaflet leaflet leaflet.heat
// Also import "leaflet/dist/leaflet.css" once globally (e.g. in App.jsx).

import { useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import HeatmapLayer from "./HeatmapLayer";
import IncidentMarker from "./IncidentMarker";
import MapLegend from "./MapLegend";
import MapFilters, { DEFAULT_MAP_FILTERS } from "./MapFilters";
import { useClusteredIncidents } from "../hooks/useClusteredIncidents";

// Fallback center if there's no data yet — adjust to your deployment region.
const DEFAULT_CENTER = [28.6139, 77.209]; // New Delhi
const DEFAULT_ZOOM = 6;

const TIME_RANGE_MS = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  all: Infinity,
};

export default function CrisisMap() {
  const { clusters, loading, error } = useClusteredIncidents();
  const [filters, setFilters] = useState(DEFAULT_MAP_FILTERS);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const filteredClusters = useMemo(() => {
    const cutoff = Date.now() - (TIME_RANGE_MS[filters.timeRange] ?? Infinity);

    return clusters.filter((c) => {
      const typeOk = filters.types.includes(c.type);
      const severityOk = (c.severity ?? 0) >= filters.minSeverity;
      const timeOk =
        filters.timeRange === "all" ||
        !c.timestamp ||
        new Date(c.timestamp).getTime() >= cutoff;
      return typeOk && severityOk && timeOk;
    });
  }, [clusters, filters]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-lg"
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <HeatmapLayer clusters={filteredClusters} visible={showHeatmap} />

        {filteredClusters.map((cluster) => (
          <IncidentMarker
            key={cluster.id}
            cluster={cluster}
            onSelect={setSelectedCluster}
          />
        ))}
      </MapContainer>

      

      <button
        onClick={() => setShowHeatmap((v) => !v)}
        className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-3 py-1.5 text-xs font-medium text-gray-700"
      >
        {showHeatmap ? "Hide" : "Show"} heatmap
      </button>

      {loading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/60 text-sm text-gray-600">
          Loading live incident data…
        </div>
      )}

      {error && (
        <div className="absolute bottom-6 right-4 z-[1000] bg-red-600 text-white text-xs rounded-lg shadow-md px-3 py-2">
          Couldn't load incident data. Retrying…
        </div>
      )}
    </div>
  );
}
