import React from 'react';
import { STATUS_LABELS, STATUS_STYLES } from '../utils/constants';

/** Color + icon + text — never color alone (Phase 21 accessibility rule). */
export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.new;
  const { Icon } = style;
  return (
    <span
      className="cm-mono inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-wide"
      style={{ color: style.color, background: style.bg, border: `1px solid ${style.color}33` }}
    >
      <Icon size={12} aria-hidden="true" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
