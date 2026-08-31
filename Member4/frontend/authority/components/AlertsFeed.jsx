import React from 'react';
import { SEVERITY_STYLES } from '../utils/constants';
import { relativeTime } from '../utils/formatters';

/**
 * Real-time Alerts Feed (Phase 13). Consumes `useAlertsFeed()`'s output —
 * a single onSnapshot listener ordered by updatedAt, prioritized by
 * severity. This component itself has no Firestore access.
 */
export default function AlertsFeed({ alerts, loading, error, onSelect }) {
  return (
    <div className="cm-glass-panel p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium">
        <span className="cm-live-dot" /> Alerts Feed
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-md bg-[color:var(--cm-bg-panel-raised)] animate-pulse" />)}
        </div>
      )}

      {error && (
        <div className="text-[12px] text-[color:var(--cm-danger)]">Couldn't load alerts. Check the Firestore connection.</div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="text-[12px] text-[color:var(--cm-text-muted)]">No recent activity.</div>
      )}

      <ul className="flex flex-col gap-2 overflow-y-auto">
        {alerts.map((incident) => {
          const style = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.moderate;
          const { Icon } = style;
          return (
            <li key={incident.incidentId}>
              <button
                onClick={() => onSelect(incident.incidentId)}
                className="cm-focusable w-full text-left rounded-md border border-[color:var(--cm-border)] px-3 py-2.5 hover:bg-[color:var(--cm-bg-panel-raised)] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color: style.color }} aria-hidden="true" />
                  <span className="cm-mono text-[10px] font-semibold uppercase" style={{ color: style.color }}>
                    {style.label} alert
                  </span>
                  <span className="ml-auto text-[10px] text-[color:var(--cm-text-muted)]">{relativeTime(incident.updatedAt)}</span>
                </div>
                <div className="text-[12px] mt-1 line-clamp-2">{incident.severitySummary || incident.incidentId}</div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
