import React from 'react';

/**
 * Required by project brief section 10: "Do not allow destructive actions
 * without confirmation. For critical incidents, show a confirmation dialog
 * before resolving or dismissing them."
 */
export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="cm-glass-panel w-full max-w-sm p-6">
        <div className="font-semibold text-[15px] mb-2">{title}</div>
        <div className="text-[13px] text-[color:var(--cm-text-secondary)] mb-6">{description}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-md text-[13px] border border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-md text-[13px] font-medium"
            style={{
              color: '#0a0d10',
              background: danger ? 'var(--cm-danger)' : 'var(--cm-operational)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
