import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useFirestoreIncidents } from "../hooks/useFirestoreIncidents";
import { getSeverityColor, TAG_ICONS, STATUS_COLORS } from "../utils/severityColors";
import "leaflet/dist/leaflet.css";

function createVolunteerIcon() {
  return L.divIcon({
    className: "volunteer-marker",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: #3B82F6; border: 2px solid #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 12px rgba(59,130,246,0.5);
      font-size: 14px;
    ">🧑</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createReliefCampIcon() {
  return L.divIcon({
    className: "relief-camp-marker",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: #10B981; border: 2px solid #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 12px rgba(16,185,129,0.5);
      font-size: 14px;
    ">⛺</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const VOLUNTEER_LOCATIONS = [
  { lat: 28.627, lng: 77.216, name: "Team Alpha — Connaught Place" },
  { lat: 28.610, lng: 77.228, name: "Team Bravo — Lodhi Colony" },
  { lat: 28.635, lng: 77.198, name: "Team Charlie — Karol Bagh" },
  { lat: 28.595, lng: 77.210, name: "Team Delta — Safdarjung" },
  { lat: 30.3165, lng: 78.0322, name: "Team Echo — Dehradun" },
  { lat: 30.0869, lng: 79.2810, name: "Team Foxtrot — Chamoli" },
  { lat: 26.1445, lng: 91.7362, name: "Team Golf — Guwahati" },
  { lat: 25.5788, lng: 91.8933, name: "Team Hotel — Shillong" },
  { lat: 19.0760, lng: 72.8777, name: "Team India — Mumbai" },
  { lat: 18.5204, lng: 73.8567, name: "Team Juliet — Pune" },
  { lat: 25.6093, lng: 85.1376, name: "Team Kilo — Patna" },
  { lat: 10.8505, lng: 76.2711, name: "Team Lima — Kochi" },
  { lat: 26.9124, lng: 75.7873, name: "Team Mike — Jaipur" },
];

const RELIEF_CAMPS = [
  { lat: 28.645, lng: 77.235, name: "Camp 1 — Mayur Vihar" },
  { lat: 28.580, lng: 77.185, name: "Camp 2 — Dwarka Sector 12" },
  { lat: 28.620, lng: 77.175, name: "Camp 3 — Rajouri Garden" },
  { lat: 30.3280, lng: 78.0500, name: "Camp 4 — Dehradun Relief" },
  { lat: 30.1000, lng: 79.3500, name: "Camp 5 — Chamoli Base" },
  { lat: 26.1800, lng: 91.7500, name: "Camp 6 — Guwahati Stadium" },
  { lat: 19.0800, lng: 72.8800, name: "Camp 7 — Mumbai Central" },
  { lat: 25.6200, lng: 85.1500, name: "Camp 8 — Patna Exhibition" },
  { lat: 10.8600, lng: 76.2800, name: "Camp 9 — Kochi Sports Hub" },
];

function createIncidentMarker(incident) {
  const color = getSeverityColor(incident.priorityScore);
  const latLng = L.latLng(incident.centerLocation.lat, incident.centerLocation.lng);
  const group = L.layerGroup();

  const haloOuter = L.circleMarker(latLng, {
    radius: 45, fillColor: color, color: "transparent", weight: 0, fillOpacity: 0.08, interactive: false,
  });
  const outerGlow = L.circleMarker(latLng, {
    radius: 32, fillColor: color, color: "transparent", weight: 0, fillOpacity: 0.18, interactive: false,
  });
  const middleGlow = L.circleMarker(latLng, {
    radius: 22, fillColor: color, color: "transparent", weight: 0, fillOpacity: 0.35, interactive: false,
  });
  const innerCore = L.circleMarker(latLng, {
    radius: 12, fillColor: color, color: "#fff", weight: 2, opacity: 0.9, fillOpacity: 1,
  });
  const centerHighlight = L.circleMarker(latLng, {
    radius: 4, fillColor: "#fff", color: "transparent", weight: 0, fillOpacity: 0.7, interactive: false,
  });

  const statusColor = STATUS_COLORS[incident.status] || "#888";
  const icon = TAG_ICONS[incident.primaryTag] || "📍";
  const neededSkillsStr = incident.neededSkills?.length > 0
    ? incident.neededSkills.map((s) => s.replace(/_/g, " ")).join(", ")
    : "None specified";

  innerCore.bindPopup(
    `
    <div style="font-family: -apple-system, sans-serif; min-width: 220px; padding: 2px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <span style="font-size: 18px;">${icon}</span>
        <div>
          <p style="font-weight: 700; font-size: 14px; color: #fff; text-transform: capitalize; margin: 0;">
            ${incident.primaryTag}
          </p>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
            <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; color: ${statusColor}; background: ${statusColor}18; border: 1px solid ${statusColor}30; border-radius: 999px; padding: 1px 8px;">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: ${statusColor};"></span>
              ${(incident.status || "unknown").replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>
      <p style="font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.5; margin: 0 0 10px;">
        ${incident.severitySummary || "No summary available"}
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; margin-bottom: 8px;">
        <div style="background: rgba(255,255,255,0.04); border-radius: 6px; padding: 6px 8px;">
          <div style="color: rgba(255,255,255,0.3); margin-bottom: 2px;">Reports</div>
          <div style="color: #fff; font-weight: 600;">${incident.reportCount ?? 0}</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); border-radius: 6px; padding: 6px 8px;">
          <div style="color: rgba(255,255,255,0.3); margin-bottom: 2px;">Confidence</div>
          <div style="color: #fff; font-weight: 600; text-transform: capitalize;">${incident.confidence || "unknown"}</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.04); border-radius: 6px; padding: 6px 8px; font-size: 10px;">
        <div style="color: rgba(255,255,255,0.3); margin-bottom: 2px;">Needed Skills</div>
        <div style="color: rgba(255,255,255,0.7); text-transform: capitalize;">${neededSkillsStr}</div>
      </div>
    </div>
    `,
    { className: "minimal-popup", closeButton: false, maxWidth: 260 }
  );

  group.addLayer(haloOuter);
  group.addLayer(outerGlow);
  group.addLayer(middleGlow);
  group.addLayer(innerCore);
  group.addLayer(centerHighlight);

  return group;
}

function hasValidLocation(i) {
  return (
    i.centerLocation != null &&
    typeof i.centerLocation.lat === "number" &&
    typeof i.centerLocation.lng === "number"
  );
}

function StaticMarkers() {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    const volunteerIcon = createVolunteerIcon();
    const campIcon = createReliefCampIcon();
    const markers = [];

    VOLUNTEER_LOCATIONS.forEach((v) => {
      const marker = L.marker([v.lat, v.lng], { icon: volunteerIcon });
      marker.bindPopup(
        `<div style="font-family: sans-serif;"><b style="color:#17324A;">🧑 ${v.name}</b><br/><span style="font-size:11px;color:#666;">Volunteer team location</span></div>`,
        { className: "minimal-popup" }
      );
      marker.addTo(map);
      markers.push(marker);
    });

    RELIEF_CAMPS.forEach((c) => {
      const marker = L.marker([c.lat, c.lng], { icon: campIcon });
      marker.bindPopup(
        `<div style="font-family: sans-serif;"><b style="color:#17324A;">⛺ ${c.name}</b><br/><span style="font-size:11px;color:#666;">Relief camp</span></div>`,
        { className: "minimal-popup" }
      );
      marker.addTo(map);
      markers.push(marker);
    });

    layersRef.current = markers;
    return () => { markers.forEach((m) => m.remove()); };
  }, [map]);

  return null;
}

function IncidentMarkers({ incidents, onSelectIncident }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    const valid = incidents.filter(hasValidLocation);
    const layers = valid.map((incident) => {
      const layer = createIncidentMarker(incident);
      layer.addTo(map);
      layer.eachLayer((l) => {
        if (l instanceof L.CircleMarker) {
          l.on("click", () => onSelectIncident?.(incident));
        }
      });
      return layer;
    });

    layersRef.current = layers;
    return () => { layers.forEach((l) => l.remove()); };
  }, [incidents, map, onSelectIncident]);

  return null;
}

function MapViewController({ selectedIncident }) {
  const map = useMap();
  useEffect(() => {
    if (selectedIncident) {
      map.flyTo([selectedIncident.lat, selectedIncident.lng], 14, { duration: 1.2 });
    }
  }, [selectedIncident, map]);
  return null;
}

export default function CrisisMap({ selectedIncident, onSelectIncident }) {
  const { incidents } = useFirestoreIncidents();

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-white/[0.08]">
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: "#17324A" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          className="dark-tiles"
        />
        <StaticMarkers />
        <IncidentMarkers incidents={incidents} onSelectIncident={onSelectIncident} />
        <MapViewController selectedIncident={selectedIncident} />
      </MapContainer>
    </div>
  );
}