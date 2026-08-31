import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, limit as fsLimit, getFirestore } from 'firebase/firestore';
import { normalizeIncident } from '../../../shared/normalizeIncident';

/**
 * Real-time Alerts Feed (Phase 13). Deliberately reuses a single
 * `onSnapshot` listener ordered by `updatedAt` descending — this naturally
 * surfaces both newly-created incidents and status changes (since
 * updateStatus() always bumps updatedAt), without a second listener on the
 * audit history subcollection. Client-side sort then prioritizes critical
 * severity within the most-recent window.
 */
export function useAlertsFeed({ maxAlerts = 15 } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, 'incidents'), orderBy('updatedAt', 'desc'), fsLimit(maxAlerts * 2));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const incidents = snap.docs.map((d) => normalizeIncident(d.data(), d.id));
        // Prioritize critical severity, then recency (already ordered by updatedAt).
        const sorted = [...incidents].sort((a, b) => {
          const aCritical = a.severity === 'critical' ? 1 : 0;
          const bCritical = b.severity === 'critical' ? 1 : 0;
          return bCritical - aCritical;
        });
        setAlerts(sorted.slice(0, maxAlerts));
        setLoading(false);
      },
      (err) => {
        console.error('[Member4] useAlertsFeed listener error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxAlerts]);

  return { alerts, loading, error };
}
