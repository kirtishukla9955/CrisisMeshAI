import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { STATUS_TRANSITIONS, STATUS_LABELS, STATUS_ACTION_LABELS } from '../utils/constants';

// Only "resolved" is a consequential/critical action in the Round 2 flow —
// there's no separate reject/escalate path anymore (Phase 3).
const CRITICAL_TARGET_STATUSES = new Set(['resolved']);

/**
 * Status-change action buttons (acknowledge → in_progress → resolved) +
 * note field. Resolving a critical-severity incident requires a
 * confirmation dialog (Phase 16). Every mutation records an audit event —
 * this component never writes any field other than `status` (via
 * onChangeStatus) or an audit note (via onAddNote).
 */
export default function AuthorityActionPanel({ incident, onChangeStatus, onAddNote, busy }) {
  const [note, setNote] = useState('');
  const [pendingStatus, setPendingStatus] = useState(null);

  if (!incident) return null;

  const allowedNext = STATUS_TRANSITIONS[incident.status] || [];
  const isCritical = incident.severity === 'critical';

  const requestStatusChange = (status) => {
    if (isCritical && CRITICAL_TARGET_STATUSES.has(status)) {
      setPendingStatus(status);
    } else {
      onChangeStatus(status, note || undefined);
      setNote('');
    }
  };

  const confirmCriticalChange = () => {
    onChangeStatus(pendingStatus, note || undefined);
    setNote('');
    setPendingStatus(null);
  };

  return (
    <div className="cm-glass-panel p-5 flex flex-col gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] mb-2">
          Current Status
        </div>
        <div className="text-[15px] font-semibold">{STATUS_LABELS[incident.status]}</div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Change incident status">
        {allowedNext.map((status) => (
          <button
            key={status}
            disabled={busy}
            onClick={() => requestStatusChange(status)}
            className="cm-focusable px-3 py-2 rounded-md text-[13px] font-medium border border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)] disabled:opacity-50"
          >
            {STATUS_ACTION_LABELS[status] || status}
          </button>
        ))}
        {allowedNext.length === 0 && (
          <span className="text-[13px] text-[color:var(--cm-text-muted)]">No further transitions — incident is resolved.</span>
        )}
      </div>

      <div>
        <label htmlFor="cm-authority-note" className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] mb-2 block">
          Add Authority Note
        </label>
        <div className="flex gap-2">
          <input
            id="cm-authority-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Rescue team dispatched."
            className="cm-focusable flex-1 rounded-md bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)] px-3 py-2 text-[13px] outline-none"
          />
          <button
            disabled={busy || !note.trim()}
            onClick={() => { onAddNote(note); setNote(''); }}
            className="cm-focusable px-3 py-2 rounded-md text-[13px] font-medium border border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)] disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
        <p className="text-[11px] text-[color:var(--cm-text-muted)] mt-1">
          Notes are recorded on the audit trail — they don't change the incident's status.
        </p>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        title={`${STATUS_ACTION_LABELS[pendingStatus] || 'Change status'}?`}
        description="This is a critical-severity incident. Confirm this action carefully — it will be recorded in the audit trail."
        confirmLabel={STATUS_ACTION_LABELS[pendingStatus] || 'Confirm'}
        danger
        onConfirm={confirmCriticalChange}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}
