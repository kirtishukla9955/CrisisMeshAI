import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import HeatmapLayer from "./HeatmapLayer";
import MapLegend from "./MapLegend";
import MapFilters, { DEFAULT_MAP_FILTERS } from "./MapFilters";
import { useClusteredIncidents } from "../hooks/useClusteredIncidents";

// Leaflet default marker icon asset fix for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [28.6139, 77.209]; // New Delhi
const DEFAULT_ZOOM = 6;

const TIME_RANGE_MS = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  all: Infinity,
};

export default function CrisisMap() {
  const { clusters = [], loading, error } = useClusteredIncidents();
  const [filters, setFilters] = useState(DEFAULT_MAP_FILTERS);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const filteredClusters = useMemo(() => {
    const cutoff = Date.now() - (TIME_RANGE_MS[filters.timeRange] ?? Infinity);

    return clusters.filter((c) => {
      // 1. Type match check
      const typeOk = !filters.types?.length || filters.types.includes(c.type);

      // 2. Severity check
      const severityOk = (c.severity ?? 0) >= (filters.minSeverity ?? 0);

      // 3. Robust Firestore Timestamp parsing
      let incidentTime = Date.now();
      if (c.timestamp?.toDate) {
        incidentTime = c.timestamp.toDate().getTime();
      } else if (c.timestamp?.seconds) {
        incidentTime = c.timestamp.seconds * 1000;
      } else if (typeof c.timestamp === "string" || typeof c.timestamp === "number") {
        incidentTime = new Date(c.timestamp).getTime();
      }

      const timeOk =
        filters.timeRange === "all" ||
        !c.timestamp ||
        incidentTime >= cutoff;

      return typeOk && severityOk && timeOk;
    });
  }, [clusters, filters]);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap Layer */}
        {showHeatmap && <HeatmapLayer points={filteredClusters} />}

        {/* Incident Markers */}
        {filteredClusters.map((incident) => {
          // Robust coordinate parsing covering all possible schema key names
          const lat = Number(incident.latitude || incident.lat || incident.centerLocation?.lat || 0);
          const lng = Number(incident.longitude || incident.lng || incident.centerLocation?.lng || 0);

          if (!lat || !lng) return null;

          return (
            <Marker
              key={incident.id}
              position={[lat, lng]}
              eventHandlers={{
                click: () => setSelectedCluster(incident),
              }}
            >
              <Popup>
                <div className="p-2 text-black">
                  <h3 className="font-bold text-sm">{incident.title || incident.type || "Incident"}</h3>
                  <p className="text-xs">Type: {incident.type}</p>
                  <p className="text-xs">Severity: {incident.severity}</p>
                  <p className="text-xs">Location: {incident.locationName || `${lat.toFixed(2)}, ${lng.toFixed(2)}`}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Control Overlay Buttons */}
      <button
        onClick={() => setShowHeatmap((v) => !v)}
        className="absolute top-4 left-14 z-[1000] bg-slate-800/90 text-white hover:bg-slate-700 backdrop-blur rounded-lg shadow-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors border border-slate-700"
      >
        {showHeatmap ? "Hide" : "Show"} heatmap
      </button>

      <MapFilters filters={filters} onFilterChange={setFilters} />
      <MapLegend />

      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm text-sm text-white font-medium">
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