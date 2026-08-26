// src/utils/geoHelpers.js
// src/utils/geoHelpers.js
export function formatCoordinates(lat, lng) {
  if (lat == null || lng == null) return "N/A";
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lngStr}`;
}

export function calculateBoundingBox(incidents) {
  if (!incidents || incidents.length === 0) return null;

  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  incidents.forEach(({ lat, lng }) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}