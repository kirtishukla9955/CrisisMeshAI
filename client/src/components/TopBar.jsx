import React from 'react';
import { clockTime } from '../utils/formatters';

export default function TopBar({ eventName = 'Active Disaster Response', lastSync }) {
  return (
    <header className="h-16 sticky top-0 z-10 flex items-center justify-between px-6 border-b border-[color:var(--cm-border)] bg-[color:var(--cm-glass)] backdrop-blur">
      <div>
        <div className="cm-mono text-[11px] tracking-[0.2em] text-[color:var(--cm-danger)] font-semibold">
          LIVE RESPONSE
        </div>
        <div className="text-[15px] font-semibold" style={{ fontFamily: 'var(--cm-font-display)' }}>{eventName}</div>
      </div>

      <div className="flex items-center gap-6 text-[12px] text-[color:var(--cm-text-secondary)]">
        <div className="flex items-center gap-2">
          <span className="cm-live-dot" />
          <span>Systems Operational</span>
        </div>
        <div className="cm-mono text-[color:var(--cm-text-muted)]">
          Last sync {lastSync ? clockTime(lastSync) : '—'}
        </div>
        <button className="relative rounded-md border border-[color:var(--cm-border-strong)] px-2.5 py-1.5 hover:bg-[color:var(--cm-bg-panel-raised)]" aria-label="Notifications">
          🔔
        </button>
      </div>
    </header>
  );
}
