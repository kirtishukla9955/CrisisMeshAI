// useClusteredIncidents.js
// Pulls already-clustered incident data from the backend's
// GET /api/incidents/clustered endpoint (Turf.js clustering happens
// server-side in clusteringService.js).
//
// Polls on an interval as a pragmatic real-time substitute — swap the
// polling block for a Firestore onSnapshot listener later if the team
// wants push updates instead.

import { useEffect, useRef, useState } from "react";

const DEFAULT_ENDPOINT = "/api/incidents/clustered";
const DEFAULT_POLL_MS = 15000;

export function useClusteredIncidents({
  endpoint = DEFAULT_ENDPOINT,
  pollMs = DEFAULT_POLL_MS,
} = {}) {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let intervalId;

    async function fetchClusters() {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Clustered incidents request failed: ${res.status}`);
        }
        const data = await res.json();
        setClusters(Array.isArray(data) ? data : data.clusters ?? []);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchClusters();
    intervalId = setInterval(fetchClusters, pollMs);

    return () => {
      clearInterval(intervalId);
      abortRef.current?.abort();
    };
  }, [endpoint, pollMs]);

  return { clusters, loading, error };
}