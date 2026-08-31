import React from 'react';
import { MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';
import AIConfidenceBadge from './AIConfidenceBadge';
import { relativeTime } from '../utils/formatters';
import { TAG_LABELS } from '../utils/constants';

export default function IncidentCard({ incident, onOpen }) {
  return (
    <button
      onClick={() => onOpen(incident.incidentId)}
      className="cm-focusable cm-glass-panel w-full text-left px-5 py-4 flex items-center gap-5 hover:border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)] transition-colors"
    >
      <SeverityBadge priorityScore={incident.priorityScore} severity={incident.severity} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="cm-mono text-[11px] text-[color:var(--cm-text-muted)]">{incident.incidentId}</span>
          <StatusBadge status={incident.status} />
        </div>
        <div className="mt-1 font-semibold text-[15px] truncate">{incident.severitySummary || TAG_LABELS[incident.primaryTag]}</div>
        <div className="mt-0.5 flex items-center gap-1 text-[13px] text-[color:var(--cm-text-secondary)] truncate">
          <MapPin size={12} aria-hidden="true" className="shrink-0" />
          {incident.centerLocation ? `${incident.centerLocation.lat.toFixed(2)}, ${incident.centerLocation.lng.toFixed(2)}` : 'Location unknown'}
          {' · '}{TAG_LABELS[incident.primaryTag] || incident.primaryTag}
          {' · '}{incident.reportCount ?? 0} reports
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <AIConfidenceBadge
          confidence={incident.confidence}
          scoringMethod={incident.scoringMethod}
          needsHumanReview={incident.needsHumanReview}
          compact
        />
        <span className="text-[11px] text-[color:var(--cm-text-muted)]">{relativeTime(incident.updatedAt)}</span>
      </div>
    </button>
  );
}
