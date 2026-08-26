// IncidentMarker.jsx
// Renders one clustered incident as a CircleMarker sized by report count
// and colored by severity. Clicking it opens ClusterPopup with details.

import { CircleMarker, Popup } from "react-leaflet";
import ClusterPopup from "./ClusterPopup";
import { getSeverityColor, getClusterRadius } from "../../utils/severityColors";

export default function IncidentMarker({ cluster, onSelect }) {
  const { lat, lng, severity = 0, reportCount = 1 } = cluster;
  const color = getSeverityColor(severity);
  const radius = getClusterRadius(reportCount);

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={radius}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 2,
      }}
      eventHandlers={{
        click: () => onSelect?.(cluster),
      }}
    >
      <Popup minWidth={240}>
        <ClusterPopup cluster={cluster} />
      </Popup>
    </CircleMarker>
  );
}
