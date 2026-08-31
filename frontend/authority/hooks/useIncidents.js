import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Realtime incident list. Uses a Firestore listener directly (rather than
 * polling the REST API) so the Command Center updates live as Member 3's
 * AI agent writes new/updated incidents, per project brief section 4 and
 * item 27 ("real-time Firestore ... avoid unnecessary polling").
 *
 * Falls back gracefully: if Firestore isn't reachable, `error` is set and
 * the UI should show its error state rather than crash.
 */
export function useIncidents({ status, severity } = {}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Replace line 28 in useIncidents.js:
  let constraints = [orderBy('severity', 'desc')];

    const db = getFirestore();
    const q = query(collection(db, 'incidents'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('[Member4] useIncidents listener error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status, severity]);

  return { incidents, loading, error };
}
