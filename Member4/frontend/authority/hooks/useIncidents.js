import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where, getFirestore } from 'firebase/firestore';
import { normalizeIncident } from '../../../shared/normalizeIncident';

/**
 * Realtime incident list. Subscribes to Firestore directly (rather than
 * polling the REST API) so the Command Center updates live as Member 3's
 * AI agent writes new/updated incidents.
 *
 * IMPORTANT: this bypasses the backend, so every document read here is
 * normalized client-side through the exact same shared/normalizeIncident.js
 * adapter the backend uses — components downstream never see a raw
 * Firestore document, canonical fields only, per the read-boundary rule.
 */
export function useIncidents({ status } = {}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let constraints = [orderBy('priorityScore', 'desc')];
    if (status) constraints.push(where('status', '==', status));

    const db = getFirestore();
    const q = query(collection(db, 'incidents'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setIncidents(snap.docs.map((d) => normalizeIncident(d.data(), d.id)));
        setLoading(false);
      },
      (err) => {
        console.error('[Member4] useIncidents listener error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status]);

  return { incidents, loading, error };
}
