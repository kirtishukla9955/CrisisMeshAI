import React, { useMemo } from 'react';
import IncidentCard from './IncidentCard';
import EmptyState from './EmptyState';
import { LOW_SIGNAL_CONFIDENCE } from '../utils/constants';

/**
 * Human Review Queue (Phase 14). Any incident with `needsHumanReview ===
 * true` appears here — that flag is authoritative and explicit in Round 2
 * (set by Member 3 or derived by shared/normalizeIncident.js for legacy
 * data). Also treats low/fallback_only confidence and a rule_based_fallback
 * scoring method as review signals even if needsHumanReview wasn't set,
 * so nothing slips through. Never auto-resolves or auto-assigns anything.
 */
export default function ReviewQueue({ incidents, onOpen }) {
  const needsReview = useMemo(
    () =>
      (incidents || []).filter(
        (i) =>
          i.needsHumanReview === true ||
          LOW_SIGNAL_CONFIDENCE.includes(i.confidence) ||
          i.scoringMethod === 'rule_based_fallback'
      ),
    [incidents]
  );

  if (needsReview.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[13px] text-[color:var(--cm-text-secondary)]">
        {needsReview.length} incident{needsReview.length !== 1 ? 's' : ''} flagged for human review — low/fallback
        AI confidence, rule-based scoring, or an explicit review flag.
      </div>
      {needsReview.map((incident) => (
        <IncidentCard key={incident.incidentId} incident={incident} onOpen={onOpen} />
      ))}
    </div>
  );
}
