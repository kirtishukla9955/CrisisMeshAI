import React, { useMemo } from 'react';
import { SEVERITY_STYLES } from '../utils/constants';
import { STATUS_LABELS } from '../utils/constants';

/**
 * Reusable Top 3 Priority Incidents panel (Phase 11). Sorted by
 * priorityScore descending, exactly the top 3. Designed to be reusable
 * across Member 2/Member 4 integration points, so it takes plain
 * `incidents` (already normalized) and a selection callback only — no
 * Firestore access of its own.
 */
export default function TopPriorityIncidents({ incidents = [], onSelect }) {
  const top3 = useMemo(
    () => [...incidents].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3),
    [incidents]
  );

  if (top3.length === 0) {
    return (
      <div className="cm-glass-panel p-4 text-[13px] text-[color:var(--cm-text-muted)]">
        No active incidents right now.
      </div>
    );
  }

  return (
    <div className="cm-glass-panel p-4">
      <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium mb-3">
        Top 3 Priority Incidents
      </div>
      <ul className="flex flex-col gap-2">
        {top3.map((incident) => {
          const style = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.moderate;
          const { Icon } = style;
          return (
            <li key={incident.incidentId}>
              <button
                onClick={() => onSelect(incident.incidentId)}
                className="cm-focusable w-full text-left flex items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-[color:var(--cm-bg-panel-raised)] transition-colors"
              >
                <Icon size={14} style={{ color: style.color }} aria-hidden="true" className="shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-medium truncate">{incident.severitySummary || incident.incidentId}</span>
                  <span className="block text-[11px] text-[color:var(--cm-text-muted)]">
                    {style.label} · {STATUS_LABELS[incident.status]}
                  </span>
                </span>
                <span className="cm-mono text-[13px] font-semibold shrink-0" style={{ color: style.color }}>
                  {incident.priorityScore}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
