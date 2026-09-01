import React from 'react';

/**
 * A single KPI tile on the Command Center homepage (Active Incidents,
 * Critical, High Priority, Resolved, Pending Review, AI Confidence).
 * Values must come from live Firestore aggregation upstream — this
 * component only renders whatever it's given, never hardcodes numbers.
 */
export default function KPICard({ label, value, accentColor = 'var(--cm-info)', suffix = '', trend }) {
  return (
    <div className="cm-glass-panel px-5 py-4 flex flex-col gap-2 min-w-[140px]">
      <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="cm-mono text-3xl font-semibold" style={{ color: accentColor }}>
          {value ?? '—'}
        </span>
        {suffix && <span className="text-sm text-[color:var(--cm-text-secondary)]">{suffix}</span>}
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`text-[11px] ${trend >= 0 ? 'text-[color:var(--cm-danger)]' : 'text-[color:var(--cm-operational)]'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last sync
        </div>
      )}
    </div>
  );
}

