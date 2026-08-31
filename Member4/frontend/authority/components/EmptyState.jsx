import React from 'react';

/**
 * "All clear" state — deliberately not a generic SaaS empty state. Reads
 * like a command center returning to normal operations, not "no data yet."
 */
export default function EmptyState() {
  return (
    <div role="status" aria-live="polite" className="cm-glass-panel px-8 py-14 flex flex-col items-center text-center gap-3">
      <span className="cm-live-dot" style={{ width: 10, height: 10 }} />
      <div className="cm-mono text-sm tracking-[0.2em] text-[color:var(--cm-operational)] font-semibold mt-2">
        ALL CLEAR
      </div>
      <div className="text-[color:var(--cm-text-secondary)] text-sm max-w-sm">
        No active incidents require authority attention. The system continues monitoring all report channels.
      </div>
    </div>
  );
}
