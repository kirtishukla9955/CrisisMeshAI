import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { clockTime } from '../utils/formatters';

export default function TopBar({ eventName = 'Active Disaster Response', lastSync, onMenuClick }) {
  return (
    <header className="h-16 sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 border-b border-[color:var(--cm-border)] bg-[color:var(--cm-glass)] backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="cm-focusable md:hidden p-1.5 rounded-md border border-[color:var(--cm-border-strong)] text-[color:var(--cm-text-secondary)]"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <div className="cm-mono text-[11px] tracking-[0.2em] text-[color:var(--cm-danger)] font-semibold">
            LIVE RESPONSE
          </div>
          <div className="text-[15px] font-semibold" style={{ fontFamily: 'var(--cm-font-display)' }}>{eventName}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 text-[12px] text-[color:var(--cm-text-secondary)]">
        <div className="hidden sm:flex items-center gap-2">
          <span className="cm-live-dot" />
          <span>Systems Operational</span>
        </div>
        <div className="hidden md:block cm-mono text-[color:var(--cm-text-muted)]">
          Last sync {lastSync ? clockTime(lastSync) : '—'}
        </div>
        <button
          className="cm-focusable relative rounded-md border border-[color:var(--cm-border-strong)] p-1.5 hover:bg-[color:var(--cm-bg-panel-raised)]"
          aria-label="Notifications"
        >
          <Bell size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
