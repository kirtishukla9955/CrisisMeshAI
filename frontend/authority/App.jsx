// frontend/authority/App.jsx
import "leaflet/dist/leaflet.css";
import "./styles/theme.css";
import React, { useState } from "react";
import CrisisMap from "./components/CrisisMap";
import MapFilters from "./components/MapFilters";
import MapLegend from "./components/MapLegend";
import { useClusteredIncidents } from "./hooks/useClusteredIncidents";
import { runSeed } from "../seed";
window.runSeed = runSeed; // Exposes function to browser window
function App() {
  // Change this line in App.jsx:
  const [filters, setFilters] = useState({ 
  type: "all", 
  minSeverity: 0,
  categories: [], // Add default arrays to prevent undefined crashes
  tags: [] 
  });
  
  const { clusters, loading: mapLoading, error } = useClusteredIncidents();

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const filteredClusters = clusters ? clusters.filter((inc) => {
    if (filters.type !== "all" && inc.type !== filters.type) return false;
    if (filters.minSeverity && inc.severity < filters.minSeverity) return false;
    return true;
  }) : [];

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="w-full bg-white shadow-sm p-4 z-20 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold text-gray-800">CrisisMesh AI — Incident Command</h1>
        {error && (
          <span className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full flex items-center">
            ⚠️ Connection issue: Retrying live updates...
          </span>
        )}
      </header>

      <main className="flex-1 relative w-full h-full overflow-hidden">
        <div className="relative w-full h-full">
          <MapFilters filters={filters} onFilterChange={handleFilterChange} />
          <CrisisMap incidents={filteredClusters} loading={mapLoading} />
          <MapLegend />
        </div>
      </main>
    </div>
  );
}

export default App;