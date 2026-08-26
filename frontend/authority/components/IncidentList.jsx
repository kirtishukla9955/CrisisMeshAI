import React from 'react';
import IncidentCard from './IncidentCard';
import EmptyState from './EmptyState';

function SkeletonCard() {
  return <div className="cm-glass-panel h-[84px] animate-pulse" />;
}

export default function IncidentList({ incidents, loading, error, onOpen }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="cm-glass-panel px-5 py-6 text-center text-[color:var(--cm-danger)] text-sm">
        Couldn't load incidents. Check the Firestore connection and retry.
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} onOpen={onOpen} />
      ))}
    </div>
  );
}
