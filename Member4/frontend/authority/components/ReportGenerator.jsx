import React, { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  'Analyzing incident history…',
  'Mapping response patterns…',
  'Evaluating severity trends…',
  'Generating authority briefing…',
];

function isoDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

const DEFAULT_TO = new Date();
const DEFAULT_FROM = new Date(DEFAULT_TO.getTime() - 30 * 24 * 60 * 60 * 1000);

/**
 * Triggers Post-Disaster AI Agent generation for a selectable time range
 * (Phase 7 — the backend requires `{from, to}`, defaulting to the last 30
 * days if left as-is). Shows a multi-stage loading sequence rather than a
 * bare spinner.
 */
export default function ReportGenerator({ onGenerate, generating }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [from, setFrom] = useState(isoDateInputValue(DEFAULT_FROM));
  const [to, setTo] = useState(isoDateInputValue(DEFAULT_TO));

  useEffect(() => {
    if (!generating) { setMessageIndex(0); return undefined; }
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = () => {
    onGenerate({
      from: new Date(from).toISOString(),
      to: new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(), // include the full "to" day
    });
  };

  return (
    <div className="cm-glass-panel p-6 flex flex-col items-center text-center gap-4">
      <div>
        <div className="cm-mono text-[11px] tracking-[0.2em] text-[color:var(--cm-ai-accent)] font-semibold">
          POST-DISASTER INTELLIGENCE
        </div>
        <div className="text-[13px] text-[color:var(--cm-text-secondary)] mt-1">
          AI-generated operational review
        </div>
      </div>

      {generating ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full border-2 border-[color:var(--cm-ai-accent)] border-t-transparent animate-spin" />
          <div className="text-[13px] text-[color:var(--cm-text-secondary)]">{LOADING_MESSAGES[messageIndex]}</div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-[12px]">
            <label className="flex items-center gap-1.5 text-[color:var(--cm-text-secondary)]">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="cm-focusable cm-mono bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)] rounded-md px-2 py-1 text-[color:var(--cm-text-primary)]"
              />
            </label>
            <label className="flex items-center gap-1.5 text-[color:var(--cm-text-secondary)]">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="cm-focusable cm-mono bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)] rounded-md px-2 py-1 text-[color:var(--cm-text-primary)]"
              />
            </label>
          </div>
          <button
            onClick={handleGenerate}
            className="cm-focusable px-4 py-2.5 rounded-md text-[13px] font-medium"
            style={{ background: 'var(--cm-ai-accent)', color: '#17324a' }}
          >
            Generate AI Report
          </button>
        </>
      )}
    </div>
  );
}
