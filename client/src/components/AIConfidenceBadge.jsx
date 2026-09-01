import React from 'react';
import { AI_CONFIDENCE_LOW_THRESHOLD } from '../utils/constants';
import { percent } from '../utils/formatters';

/**
 * The visible carrier of the project's "human-in-the-loop" AI safety
 * requirement (brief section 7 / instructions section 11-12). Every AI
 * output must expose its confidence; low confidence must be visually
 * unmistakable and route to the human review queue.
 */
export default function AIConfidenceBadge({ confidence, fallbackUsed = false, compact = false }) {
  if (fallbackUsed) {
    return (
      <span className="cm-mono inline-flex items-center gap-1.5 rounded-md border border-[color:var(--cm-border-strong)] bg-[color:var(--cm-bg-panel-raised)] px-2 py-1 text-[11px] text-[color:var(--cm-text-secondary)]">
        ⚙ RULE-BASED FALLBACK
      </span>
    );
  }

  const isLow = confidence !== null && confidence !== undefined && confidence < AI_CONFIDENCE_LOW_THRESHOLD;

  if (isLow) {
    return (
      <span className="cm-mono inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
        style={{ color: 'var(--cm-warning)', background: 'var(--cm-medium-bg)', borderColor: 'var(--cm-warning)55' }}>
        ⚠ LOW AI CONFIDENCE — REVIEW REQUIRED
      </span>
    );
  }

  return (
    <span
      className="cm-mono inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
      style={{ color: 'var(--cm-ai-accent)', background: 'rgba(167,139,250,0.10)', borderColor: 'rgba(167,139,250,0.35)' }}
    >
      ✦ AI CONFIDENCE {percent(confidence)}
      {!compact && <span className="text-[color:var(--cm-text-muted)] font-normal ml-1">· human review available</span>}
    </span>
  );
}
