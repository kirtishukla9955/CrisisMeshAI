import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { STATUS_TRANSITIONS, STATUS_LABELS } from '../utils/constants';

const CRITICAL_TARGET_STATUSES = new Set(['resolved', 'rejected']);

const ACTION_LABELS = {
  under_review: 'Move to Review',
  assigned: 'Assign',
  in_progress: 'Mark In Progress',
  resolved: 'Mark Resolved',
  escalated: 'Escalate',
  rejected: 'Reject / Invalid',
};

/**
 * Status-change action buttons + note field. Critical incidents require a
 * confirmation dialog before resolving/rejecting, per project brief
 * section 10.
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

      <div className="flex flex-wrap gap-2">
        {allowedNext.map((status) => (
          <button
            key={status}
            disabled={busy}
            onClick={() => requestStatusChange(status)}
            className="px-3 py-2 rounded-md text-[13px] font-medium border border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)] disabled:opacity-50"
          >
            {ACTION_LABELS[status] || status}
          </button>
        ))}
        {allowedNext.length === 0 && (
          <span className="text-[13px] text-[color:var(--cm-text-muted)]">No further transitions — incident is closed.</span>
        )}
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] mb-2 block">
          Add Authority Note
        </label>
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Rescue team dispatched."
            className="flex-1 rounded-md bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--cm-info)]"
          />
          <button
            disabled={busy || !note.trim()}
            onClick={() => { onAddNote(note); setNote(''); }}
            className="px-3 py-2 rounded-md text-[13px] font-medium border border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)] disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        title={`${ACTION_LABELS[pendingStatus] || 'Change status'}?`}
        description="This is a critical-severity incident. Confirm this action carefully — it will be recorded in the audit trail."
        confirmLabel={ACTION_LABELS[pendingStatus] || 'Confirm'}
        danger={pendingStatus === 'rejected'}
        onConfirm={confirmCriticalChange}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}
