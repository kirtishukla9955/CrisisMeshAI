import React from 'react';
import { LayoutDashboard, AlertOctagon, Bell, FolderOpen, Users, ChevronDown, X } from 'lucide-react';

// Exactly the 5 items the Round 2 guide specifies — no extra navigation
// added just to fill space (Phase 10 explicit instruction).
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'incidents', label: 'Incidents', Icon: AlertOctagon },
  { key: 'alerts', label: 'Alerts', Icon: Bell },
  { key: 'resources', label: 'Resources', Icon: FolderOpen, hasDropdown: true },
  { key: 'users', label: 'Users', Icon: Users },
];

/**
 * `isOpen`/`onClose` support the Phase 20 responsive requirement: on
 * tablet/mobile widths, the sidebar becomes an off-canvas panel instead of
 * a permanent column. `Resources` shows a dropdown chevron per the mockup
 * but Member 4 doesn't own resource management, so it's a stub nav item —
 * clicking it still calls onNavigate, no fabricated submenu content.
 */
export default function Sidebar({ active, onNavigate, authority, isOpen = true, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`w-[240px] shrink-0 h-screen fixed md:sticky top-0 z-40 flex flex-col border-r border-[color:var(--cm-border)] bg-[color:var(--cm-bg-panel)] transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 flex items-center justify-between border-b border-[color:var(--cm-border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[color:var(--cm-danger)] flex items-center justify-center text-[13px] font-bold text-white">
              C
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-[14px]" style={{ fontFamily: 'var(--cm-font-display)' }}>CrisisMesh AI</div>
              <div className="text-[10px] text-[color:var(--cm-text-muted)] cm-mono">AUTHORITY CONSOLE</div>
            </div>
          </div>
          <button onClick={onClose} className="cm-focusable md:hidden p-1 text-[color:var(--cm-text-secondary)]" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1" aria-label="Authority dashboard navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              aria-current={active === item.key ? 'page' : undefined}
              className={`cm-focusable flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-left transition-colors ${
                active === item.key
                  ? 'bg-[color:var(--cm-bg-panel-raised)] text-[color:var(--cm-text-primary)] border border-[color:var(--cm-border-strong)]'
                  : 'text-[color:var(--cm-text-secondary)] hover:bg-[color:var(--cm-bg-panel-raised)] hover:text-[color:var(--cm-text-primary)] border border-transparent'
              }`}
            >
              <item.Icon size={16} aria-hidden="true" className="opacity-80" />
              <span className="flex-1">{item.label}</span>
              {item.hasDropdown && <ChevronDown size={14} aria-hidden="true" className="opacity-60" />}
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
    </>
  );
}
