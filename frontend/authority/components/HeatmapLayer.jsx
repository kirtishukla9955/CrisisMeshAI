// HeatmapLayer.jsx
// Thin bridge between react-leaflet and the imperative leaflet.heat plugin.
// leaflet.heat has no React wrapper, so we grab the underlying Leaflet map
// instance via useMap() and manage the heat layer's lifecycle manually.
//
// npm install leaflet.heat

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { getHeatIntensity } from "../../utils/severityColors";

export default function HeatmapLayer({ clusters = [], visible = true }) {
  const map = useMap();

  useEffect(() => {
    if (!visible || clusters.length === 0) return undefined;

    const points = clusters.map((c) => [
      c.lat,
      c.lng,
      getHeatIntensity(c.severity),
    ]);

    const heatLayer = L.heatLayer(points, {
      radius: 28,
      blur: 22,
      maxZoom: 14,
      gradient: {
        0.2: "#22c55e",
        0.4: "#eab308",
        0.6: "#f97316",
        0.8: "#ef4444",
        1.0: "#991b1b",
      },
    });

    heatLayer.addTo(map);

    // Clean up on unmount / whenever the input data changes, so we don't
    // stack duplicate heat layers on every re-render.
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, clusters, visible]);

  // This component renders no DOM of its own — it only manages a Leaflet layer.
  return null;
}
