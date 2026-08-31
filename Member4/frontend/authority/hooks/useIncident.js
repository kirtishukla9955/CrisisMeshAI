import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { normalizeIncident } from '../../../shared/normalizeIncident';
import { incidentService } from '../services/incidentService';

/**
 * Single-incident detail hook. Subscribes to the incident doc directly
 * (normalized client-side, same as useIncidents) for live status/AI-field
 * updates, and fetches reports + suggested-volunteer details + history via
 * the REST API — those come back already normalized by the backend.
 */
export function useIncident(incidentId) {
  const [incident, setIncident] = useState(null);
  const [reports, setReports] = useState([]);
  const [suggestedVolunteerDetails, setSuggestedVolunteerDetails] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshDetails = useCallback(async () => {
    try {
      const [{ reports: r, suggestedVolunteerDetails: svd }, h] = await Promise.all([
        incidentService.get(incidentId),
        incidentService.getHistory(incidentId),
      ]);
      setReports(r);
      setSuggestedVolunteerDetails(svd);
      setHistory(h);
    } catch (err) {
      console.error('[Member4] failed to load incident details:', err);
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
        setIncident(snap.exists() ? normalizeIncident(snap.data(), snap.id) : null);
        setLoading(false);
      },
      (err) => {
        console.error('[Member4] useIncident listener error:', err);
        setError(err);
        setLoading(false);
      }
    );

    refreshDetails();

    return () => unsubscribe();
  }, [incidentId, refreshDetails]);

  return { incident, reports, suggestedVolunteerDetails, history, loading, error, refresh: refreshDetails };
}
