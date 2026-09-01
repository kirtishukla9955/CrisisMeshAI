import React, { useMemo } from 'react';
import IncidentCard from './IncidentCard';
import EmptyState from './EmptyState';
import { AI_CONFIDENCE_LOW_THRESHOLD } from '../utils/constants';

/**
 * Human Review Queue — every low-confidence or fallback-scored incident
 * lands here automatically (project brief section 7 / instructions 12).
 * Nothing is ever silently dropped: this view exists precisely so a
 * failed or uncertain AI call still surfaces to a person.
 */
export default function ReviewQueue({ incidents, onOpen }) {
  const needsReview = useMemo(
    () =>
      (incidents || []).filter(
        (i) => i.aiFallbackUsed || (i.aiConfidence !== undefined && i.aiConfidence < AI_CONFIDENCE_LOW_THRESHOLD)
      ),
    [incidents]
  );

  if (needsReview.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[13px] text-[color:var(--cm-text-secondary)]">
        {needsReview.length} incident{needsReview.length !== 1 ? 's' : ''} flagged for human review — low AI
        confidence or rule-based fallback scoring.
      </div>
      {needsReview.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} onOpen={onOpen} />
      ))}
    </div>
  );
}
