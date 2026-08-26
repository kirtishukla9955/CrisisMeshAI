import { useCallback, useEffect, useState } from 'react';
import { reportService } from '../services/reportService';

export function usePostDisasterReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    reportService
      .getLatest()
      .then(setReport)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const generate = useCallback(async (eventId) => {
    setGenerating(true);
    setError(null);
    try {
      const newReport = await reportService.generate(eventId);
      setReport(newReport);
      return newReport;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { report, loading, generating, error, generate };
}
