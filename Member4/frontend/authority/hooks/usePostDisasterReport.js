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

  /** @param {{from?: string, to?: string}} period */
  const generate = useCallback(async (period) => {
    setGenerating(true);
    setError(null);
    try {
      const newReport = await reportService.generate(period);
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
