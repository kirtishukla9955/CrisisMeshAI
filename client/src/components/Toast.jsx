import React, { useEffect } from 'react';

const TONE_COLOR = {
  success: 'var(--cm-operational)',
  error: 'var(--cm-danger)',
  info: 'var(--cm-info)',
};

export default function Toast({ message, tone = 'info', onDismiss, durationMs = 4000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed top-6 right-6 z-50 cm-glass-panel px-4 py-3 flex items-center gap-2 text-[13px] max-w-sm"
      style={{ borderColor: `${TONE_COLOR[tone]}55` }}
    >
      <span style={{ color: TONE_COLOR[tone] }}>●</span>
      <span>{message}</span>
    </div>
  );
}
