import React from 'react';
import { SEVERITY_STYLES } from '../utils/constants';

/**
 * The priority score is the single most important number on an incident
 * card (project brief: "make the priority score visually prominent").
 * Rendered as a large mono numeral with a severity-colored ring rather than
 * a plain badge, so it reads instantly in a dense list.
 */
export default function PriorityBadge({ score, severity, size = 'md' }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium;
  const dims = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg';

  return (
    <div className="flex items-center gap-3">
      <div
        className={`cm-mono ${dims} flex items-center justify-center rounded-full font-semibold shrink-0`}
        style={{ color: style.color, background: style.bg, border: `2px solid ${style.color}55` }}
        title={`Priority score ${score}`}
      >
        {score ?? '—'}
      </div>
      <div>
        <div
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: style.color }}
        >
          {style.label}
        </div>
        <div className="text-[11px] text-[color:var(--cm-text-muted)]">Priority {score ?? '—'}/100</div>
      </div>
    </div>
  );
}
