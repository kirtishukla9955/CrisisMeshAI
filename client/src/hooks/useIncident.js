import { useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services/incidentService';

export function useIncident(incidentId) {
  const [incident, setIncident] = useState(null);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!incidentId) return;
    try {
      setLoading(true);
      setError(null);
      
      // We can fetch concurrently
      const [incData, repData, histData] = await Promise.all([
        incidentService.getIncident(incidentId),
        incidentService.getIncidentReports(incidentId).catch(() => []),
        incidentService.getIncidentHistory(incidentId).catch(() => [])
      ]);
      
      setIncident(incData);
      setReports(repData);
      setHistory(histData);
    } catch (err) {
      setError(err.message || 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { incident, reports, history, loading, error, refresh: fetchAll };
}
