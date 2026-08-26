// MapLegend.jsx
// Static legend overlay explaining what the marker/heatmap colors mean.
// Pulls directly from SEVERITY_BANDS so it can never drift out of sync
// with the actual marker colors.

import { SEVERITY_BANDS } from "../../utils/severityColors";

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-3 py-2 text-xs space-y-1">
      <div className="font-semibold text-gray-700 mb-1">Severity</div>
      {SEVERITY_BANDS.map((band) => (
        <div key={band.label} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: band.color }}
          />
          <span className="text-gray-600">{band.label}</span>
        </div>
      ))}
    </div>
  );
}
