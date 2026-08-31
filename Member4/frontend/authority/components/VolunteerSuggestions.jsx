import React from 'react';
import { Phone, ShieldCheck, ShieldOff } from 'lucide-react';

/**
 * Displays Member 3's algorithmically-suggested volunteers for an incident
 * and lets the authority confirm one as the actual assignment. Member 4
 * does not generate these suggestions (that's Member 3's matching
 * algorithm) — it only displays them and records a confirmation as an
 * audit event (see AuthorityActionPanel's sibling call,
 * incidentService.confirmVolunteer). Past confirmations are visible in the
 * incident's timeline/audit history, not duplicated here.
 */
export default function VolunteerSuggestions({ suggestedVolunteerDetails, onConfirm, busy }) {
  if (!suggestedVolunteerDetails || suggestedVolunteerDetails.length === 0) {
    return (
      <div className="text-[13px] text-[color:var(--cm-text-muted)]">
        No volunteer suggestions yet for this incident.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {suggestedVolunteerDetails.map((v) => (
        <div key={v.volunteerId} className="border border-[color:var(--cm-border)] rounded-md p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[13px] truncate">{v.name}</span>
              {v.isVerified ? (
                <ShieldCheck size={13} className="text-[color:var(--cm-operational)]" aria-label="Verified volunteer" />
              ) : (
                <ShieldOff size={13} className="text-[color:var(--cm-text-muted)]" aria-label="Unverified volunteer" />
              )}
            </div>
            <div className="text-[11px] text-[color:var(--cm-text-secondary)] mt-0.5">
              {(v.skills || []).join(', ') || 'No listed skills'}
            </div>
            {v.phone && (
              <div className="flex items-center gap-1 text-[11px] text-[color:var(--cm-text-muted)] mt-0.5">
                <Phone size={11} aria-hidden="true" /> {v.phone}
              </div>
            )}
          </div>
          <button
            disabled={busy || v.isAvailable === false}
            onClick={() => onConfirm(v.volunteerId, v.name)}
            className="cm-focusable shrink-0 px-3 py-2 rounded-md text-[12px] font-medium border border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)] disabled:opacity-40"
            title={v.isAvailable === false ? 'Marked unavailable by Member 3\'s matching system' : undefined}
          >
            Confirm
          </button>
        </div>
      ))}
    </div>
  );
}
