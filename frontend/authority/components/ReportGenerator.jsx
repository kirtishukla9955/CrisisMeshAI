import React, { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  'Analyzing incident history…',
  'Mapping response patterns…',
  'Evaluating severity trends…',
  'Generating authority briefing…',
];

/**
 * Triggers Post-Disaster AI Agent generation. Shows a multi-stage loading
 * sequence rather than a bare spinner (project brief section 20).
 */
export default function ReportGenerator({ onGenerate, generating }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!generating) { setMessageIndex(0); return undefined; }
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [generating]);

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
        <button
          onClick={onGenerate}
          className="px-4 py-2.5 rounded-md text-[13px] font-medium"
          style={{ background: 'var(--cm-ai-accent)', color: '#0a0d10' }}
        >
          Generate AI Report
        </button>
      )}
    </div>
  );
}
