import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { incidentService } from '../services/incidentService';

/**
 * Single-incident detail hook. Subscribes to the incident doc directly for
 * live status/AI-confidence updates, and fetches reports + history via the
 * REST API (those are read-once list views, not worth a live listener).
 */
export function useIncident(incidentId) {
  const [incident, setIncident] = useState(null);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshReportsAndHistory = useCallback(async () => {
    try {
      const [{ reports: r }, h] = await Promise.all([
        incidentService.get(incidentId),
        incidentService.getHistory(incidentId),
      ]);
      setReports(r);
      setHistory(h);
    } catch (err) {
      console.error('[Member4] failed to load reports/history:', err);
      setError(err);
    }
  }, [incidentId]);

  useEffect(() => {
    if (!incidentId) return undefined;
    setLoading(true);
    setError(null);

    const db = getFirestore();
    const unsubscribe = onSnapshot(
      doc(db, 'incidents', incidentId),
      (snap) => {
        setIncident(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (err) => {
        console.error('[Member4] useIncident listener error:', err);
        setError(err);
        setLoading(false);
      }
    );

    refreshReportsAndHistory();

    return () => unsubscribe();
  }, [incidentId, refreshReportsAndHistory]);

  return { incident, reports, history, loading, error, refresh: refreshReportsAndHistory };
}
