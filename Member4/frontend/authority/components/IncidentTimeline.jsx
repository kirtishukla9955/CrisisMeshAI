import React from 'react';
import { clockTime, titleCase } from '../utils/formatters';

const EVENT_LABELS = {
  status_change: (e) => `Status changed: ${titleCase(e.fromStatus || '—')} → ${titleCase(e.toStatus)}`,
  volunteer_confirmed: (e) => e.note || 'Volunteer assignment confirmed',
  note: (e) => e.note || 'Authority note added',
  insight_report_generated: (e) => e.note || 'Included in post-disaster insight report',
};

/**
 * Chronological event timeline for an incident, built from the audit
 * history collection (Member 4-owned) — not a hardcoded mock sequence.
 */
export default function IncidentTimeline({ events }) {
  if (!events || events.length === 0) {
    return <div className="text-[13px] text-[color:var(--cm-text-muted)]">No recorded events yet.</div>;
  }

  return (
    <ol className="relative border-l border-[color:var(--cm-border-strong)] pl-5 flex flex-col gap-5">
      {events
        .slice()
        .reverse()
        .map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-[color:var(--cm-info)]" />
            <div className="cm-mono text-[11px] text-[color:var(--cm-text-muted)]">{clockTime(event.timestamp)}</div>
            <div className="text-[13px]">{(EVENT_LABELS[event.type] || (() => event.type))(event)}</div>
            <div className="text-[11px] text-[color:var(--cm-text-secondary)] mt-0.5">by {event.actorName}</div>
          </li>
        ))}
    </ol>
  );
}
