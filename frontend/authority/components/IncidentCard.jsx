import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import AIConfidenceBadge from './AIConfidenceBadge';
import { relativeTime, titleCase } from '../utils/formatters';

export default function IncidentCard({ incident, onOpen }) {
  return (
    <button
      onClick={() => onOpen(incident.id)}
      className="cm-glass-panel w-full text-left px-5 py-4 flex items-center gap-5 hover:border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)] transition-colors"
    >
      <PriorityBadge score={incident.priorityScore} severity={incident.severity} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="cm-mono text-[11px] text-[color:var(--cm-text-muted)]">{incident.id}</span>
          <StatusBadge status={incident.status} />
        </div>
        <div className="mt-1 font-semibold text-[15px] truncate">{incident.title}</div>
        <div className="mt-0.5 text-[13px] text-[color:var(--cm-text-secondary)] truncate">
          {incident.locationLabel} · {titleCase(incident.category)} · {incident.reportCount ?? 0} reports
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <AIConfidenceBadge confidence={incident.aiConfidence} fallbackUsed={incident.aiFallbackUsed} compact />
        <span className="text-[11px] text-[color:var(--cm-text-muted)]">{relativeTime(incident.createdAt)}</span>
      </div>
    </button>
  );
}
