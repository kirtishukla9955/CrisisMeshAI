import React from 'react';
import { Camera, Mic, MapPin, Send } from 'lucide-react';

/**
 * Quick Report shortcut panel (Phase 12), matching the mockup's layout.
 * Member 4 does NOT own report intake — this is an integration slot that
 * calls `onOpenQuickReport()` (Member 1's actual quick-report flow). If no
 * callback is wired up yet, the panel shows a clearly-labeled integration
 * state instead of pretending a report was submitted.
 */
export default function QuickReportPanel({ onOpenQuickReport }) {
  const wired = typeof onOpenQuickReport === 'function';

  return (
    <div className="cm-glass-panel p-4 flex flex-col gap-3">
      <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium">
        Quick Report
      </div>

      <button
        onClick={onOpenQuickReport}
        disabled={!wired}
        className="cm-focusable rounded-md border border-[color:var(--cm-border-strong)] bg-[color:var(--cm-bg-panel-raised)] h-16 flex items-center justify-center gap-2 text-[13px] text-[color:var(--cm-text-secondary)] hover:bg-[color:var(--cm-bg-panel)] disabled:opacity-50"
      >
        <Camera size={18} aria-hidden="true" /> Attach photo
      </button>

      <button
        onClick={onOpenQuickReport}
        disabled={!wired}
        className="cm-focusable rounded-md border border-[color:var(--cm-border-strong)] bg-[color:var(--cm-bg-panel-raised)] h-16 flex items-center justify-center gap-2 text-[13px] text-[color:var(--cm-text-secondary)] hover:bg-[color:var(--cm-bg-panel)] disabled:opacity-50"
      >
        <Mic size={18} aria-hidden="true" /> Voice note
      </button>

      <div className="rounded-md border border-[color:var(--cm-border)] px-3 py-2 flex items-center gap-2 text-[12px] text-[color:var(--cm-text-muted)]">
        <MapPin size={13} aria-hidden="true" /> Location or Directory URL
      </div>

      <button
        onClick={onOpenQuickReport}
        disabled={!wired}
        className="cm-focusable rounded-md py-2.5 flex items-center justify-center gap-2 text-[13px] font-semibold disabled:opacity-50"
        style={{ background: 'var(--cm-high)', color: '#17324a' }}
      >
        <Send size={15} aria-hidden="true" />
        {wired ? 'Submit Report' : 'Report intake not connected'}
      </button>

      {!wired && (
        <p className="text-[11px] text-[color:var(--cm-text-muted)]">
          This panel calls Member 1's quick-report flow via <code className="cm-mono">onOpenQuickReport()</code> — not
          yet wired up in this standalone slice.
        </p>
      )}
    </div>
  );
}
