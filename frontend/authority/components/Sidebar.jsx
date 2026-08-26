import React from 'react';

const NAV_ITEMS = [
  { key: 'command-center', label: 'Command Center', icon: '◈' },
  { key: 'live-incidents', label: 'Live Incidents', icon: '▲' },
  { key: 'priority-queue', label: 'Priority Queue', icon: '⚑' },
  { key: 'analytics', label: 'Analytics', icon: '▤' },
  { key: 'ai-reports', label: 'AI Reports', icon: '✦' },
  { key: 'response-history', label: 'Response History', icon: '↻' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar({ active, onNavigate, authority }) {
  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 flex flex-col border-r border-[color:var(--cm-border)] bg-[color:var(--cm-bg-panel)]">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-[color:var(--cm-border)]">
        <div className="w-7 h-7 rounded-md bg-[color:var(--cm-danger)] flex items-center justify-center text-[13px] font-bold text-[#0a0d10]">
          C
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-[14px]" style={{ fontFamily: 'var(--cm-font-display)' }}>CrisisMesh AI</div>
          <div className="text-[10px] text-[color:var(--cm-text-muted)] cm-mono">AUTHORITY CONSOLE</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-left transition-colors ${
              active === item.key
                ? 'bg-[color:var(--cm-bg-panel-raised)] text-[color:var(--cm-text-primary)] border border-[color:var(--cm-border-strong)]'
                : 'text-[color:var(--cm-text-secondary)] hover:bg-[color:var(--cm-bg-panel-raised)] hover:text-[color:var(--cm-text-primary)] border border-transparent'
            }`}
          >
            <span className="w-4 text-center opacity-80">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-[color:var(--cm-border)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)] flex items-center justify-center text-[12px] font-semibold">
          {(authority?.name || 'DA').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-medium truncate">{authority?.name || 'District Emergency Authority'}</div>
          <div className="text-[10px] text-[color:var(--cm-operational)] flex items-center gap-1">
            <span className="cm-live-dot" /> Operational
          </div>
        </div>
      </div>
    </aside>
  );
}
