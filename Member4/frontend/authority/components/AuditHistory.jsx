import React from 'react';
import { clockTime, titleCase } from '../utils/formatters';

/**
 * Tabular audit trail — every authority action, traceable. Distinct from
 * IncidentTimeline (which reads as a narrative); this is the accountability
 * record referenced in project brief section 18.
 */
export default function AuditHistory({ events }) {
  if (!events || events.length === 0) {
    return <div className="text-[13px] text-[color:var(--cm-text-muted)]">No audit events recorded.</div>;
  }

  return (
    <div className="cm-glass-panel overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] border-b border-[color:var(--cm-border)]">
            <th className="px-4 py-2.5 font-medium">Action</th>
            <th className="px-4 py-2.5 font-medium">From</th>
            <th className="px-4 py-2.5 font-medium">To</th>
            <th className="px-4 py-2.5 font-medium">By</th>
            <th className="px-4 py-2.5 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-b border-[color:var(--cm-border)] last:border-0">
              <td className="px-4 py-2.5">{titleCase(e.type)}</td>
              <td className="px-4 py-2.5 text-[color:var(--cm-text-secondary)]">{e.fromStatus ? titleCase(e.fromStatus) : '—'}</td>
              <td className="px-4 py-2.5 text-[color:var(--cm-text-secondary)]">{e.toStatus ? titleCase(e.toStatus) : '—'}</td>
              <td className="px-4 py-2.5">{e.actorName}</td>
              <td className="cm-mono px-4 py-2.5 text-[color:var(--cm-text-muted)]">{clockTime(e.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
