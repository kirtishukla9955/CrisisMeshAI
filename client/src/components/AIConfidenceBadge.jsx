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
      <span className="font-mono inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/60 shadow-sm">
        ⚙ RULE-BASED FALLBACK
      </span>
    );
  }

  const isLow = confidence !== null && confidence !== undefined && confidence < AI_CONFIDENCE_LOW_THRESHOLD;

  if (isLow) {
    return (
      <span className="font-mono inline-flex items-center gap-1.5 rounded-md border border-[#f1c40f]/40 bg-[#f1c40f]/10 px-2.5 py-1 text-xs font-bold text-[#f1c40f] shadow-[0_0_10px_rgba(241,196,15,0.2)]">
        ⚠ LOW AI CONFIDENCE — REVIEW REQUIRED
      </span>
    );
  }

  return (
    <span className="font-mono inline-flex items-center gap-1.5 rounded-md border border-[#9b59b6]/40 bg-[#9b59b6]/10 px-2.5 py-1 text-xs font-bold text-[#9b59b6] shadow-[0_0_10px_rgba(155,89,182,0.15)]">
      ✨ AI CONFIDENCE {percent(confidence)}
      {!compact && <span className="text-white/40 font-normal ml-1">· human review available</span>}
    </span>
  );
}
