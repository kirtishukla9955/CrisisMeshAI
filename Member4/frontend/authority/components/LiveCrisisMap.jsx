import React, { useMemo } from 'react';
import { MapPin, Users, Tent } from 'lucide-react';
import { SEVERITY_STYLES } from '../utils/constants';

/**
 * Integration boundary for Member 2's live crisis map (Phase 10). Member 4
 * does NOT rebuild Member 2's Leaflet map — this component defines the
 * props contract and renders whatever real map component is injected via
 * `MapComponent`.
 *
 * Usage once Member 2's component exists:
 *   <LiveCrisisMap incidents={incidents} onIncidentSelect={openIncident} MapComponent={Member2LeafletMap} />
 *
 * If `MapComponent` is not provided (e.g. running this slice standalone,
 * or before integration), this renders a clearly-labeled DEMO placeholder
 * — schematic dot positions from raw lat/lng, NOT a real projected map —
 * so it can never be mistaken for a live map. It still supports clicking
 * an incident through to the detail view, so the rest of the dashboard is
 * demoable before Member 2's map is wired in.
 */
export default function LiveCrisisMap({ incidents = [], onIncidentSelect, MapComponent }) {
  if (MapComponent) {
    return <MapComponent incidents={incidents} onIncidentSelect={onIncidentSelect} />;
  }

  return <DemoMapPlaceholder incidents={incidents} onIncidentSelect={onIncidentSelect} />;
}

function DemoMapPlaceholder({ incidents, onIncidentSelect }) {
  const located = incidents.filter((i) => i.centerLocation);

  const bounds = useMemo(() => {
    if (located.length === 0) return null;
    const lats = located.map((i) => i.centerLocation.lat);
    const lngs = located.map((i) => i.centerLocation.lng);
    return {
      minLat: Math.min(...lats), maxLat: Math.max(...lats),
      minLng: Math.min(...lngs), maxLng: Math.max(...lngs),
    };
  }, [located]);

  const toPercent = (incident) => {
    if (!bounds) return { left: '50%', top: '50%' };
    const latRange = bounds.maxLat - bounds.minLat || 1;
    const lngRange = bounds.maxLng - bounds.minLng || 1;
    const x = ((incident.centerLocation.lng - bounds.minLng) / lngRange) * 80 + 10;
    const y = (1 - (incident.centerLocation.lat - bounds.minLat) / latRange) * 80 + 10;
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="cm-glass-panel relative h-[320px] overflow-hidden">
      <div className="absolute top-3 left-3 z-10 cm-mono text-[10px] tracking-wider px-2 py-1 rounded bg-black/50 border border-[color:var(--cm-border-strong)] text-[color:var(--cm-warning)]">
        DEMO PLACEHOLDER — not a live map. Connect Member 2's map component via the `MapComponent` prop.
      </div>

      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(90,169,230,0.25), transparent 40%), radial-gradient(circle at 70% 70%, rgba(90,169,230,0.2), transparent 45%)',
      }} />

      {located.map((incident) => {
        const style = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.moderate;
        const pos = toPercent(incident);
        return (
          <button
            key={incident.incidentId}
            onClick={() => onIncidentSelect(incident.incidentId)}
            className="cm-focusable absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-125"
            style={{ left: pos.left, top: pos.top, width: 14, height: 14, background: style.color, boxShadow: `0 0 12px 2px ${style.color}66` }}
            title={`${incident.severitySummary || incident.incidentId} — priority ${incident.priorityScore}`}
            aria-label={`Open incident ${incident.incidentId}, ${style.label} priority`}
          />
        );
      })}

      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 text-[11px] cm-mono bg-black/40 rounded-md p-2 border border-[color:var(--cm-border)]">
        {Object.entries(SEVERITY_STYLES).map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 pt-1 border-t border-[color:var(--cm-border)] mt-1">
          <Users size={11} aria-hidden="true" /> Volunteer location
        </div>
        <div className="flex items-center gap-1.5">
          <Tent size={11} aria-hidden="true" /> Relief camps
        </div>
      </div>

      {located.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[color:var(--cm-text-muted)] gap-2">
          <MapPin size={14} aria-hidden="true" /> No located incidents to display.
        </div>
      )}
    </div>
  );
}
