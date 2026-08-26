// frontend/authority/pages/MapPage.jsx
import React, { useState } from "react";
import CrisisMap from "../components/CrisisMap";
import MapFilters from "../components/MapFilters";
import MapLegend from "../components/MapLegend";
import { useClusteredIncidents } from "../hooks/useClusteredIncidents";

export default function MapPage() {
  const [filters, setFilters] = useState({
    type: "all",
    minSeverity: 0,
  });

  // Fetch clustered incidents using your existing polling hook
  const { clusters, loading, error } = useClusteredIncidents();

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Filter clusters based on MapFilters selection
  const filteredClusters = clusters.filter((inc) => {
    if (filters.type !== "all" && inc.type !== filters.type) {
      return false;
    }
    if (filters.minSeverity && inc.severity < filters.minSeverity) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Dynamic Filter Controls Overlay */}
      <MapFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Main Leaflet Map View */}
      <CrisisMap incidents={filteredClusters} loading={loading} />

      {/* Dynamic Color/Severity Scale Legend */}
      <MapLegend />

      {/* Optional Error Notice */}
      {error && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ef4444",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "6px",
            zIndex: 1000,
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Failed to fetch live incident data. Retrying...
        </div>
      )}
    </div>
  );
}