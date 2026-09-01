import { useState, useEffect } from "react";
import { db, collection, onSnapshot } from "../firebase";

function mapConfidence(val) {
  if (typeof val === "string") {
    if (["high", "medium", "low", "fallback_only"].includes(val)) return val;
    return "medium";
  }
  if (typeof val === "number") {
    if (val >= 0.75) return "high";
    if (val >= 0.5) return "medium";
    if (val > 0) return "low";
    return "fallback_only";
  }
  return "medium";
}

function mapStatus(val) {
  if (!val) return "new";
  const lower = val.toLowerCase();
  if (lower === "active" || lower === "new") return "new";
  if (lower === "acknowledged" || lower === "confirmed") return "acknowledged";
  if (lower === "in_progress" || lower === "in progress" || lower === "ongoing") return "in_progress";
  if (lower === "resolved" || lower === "closed" || lower === "complete") return "resolved";
  return "new";
}

function normalizeDoc(raw) {
  const lat = raw.latitude ?? raw.lat ?? raw.centerLocation?.lat;
  const lng = raw.longitude ?? raw.lng ?? raw.centerLocation?.lng;

  return {
    id: raw.id,
    centerLocation: {
      lat: typeof lat === "number" ? lat : 0,
      lng: typeof lng === "number" ? lng : 0,
    },
    reportIds: raw.reportIds ?? [],
    reportCount: Number(raw.reportCount ?? raw.affectedPeople ?? 0),
    primaryTag: String(raw.primaryTag ?? raw.type ?? "unknown"),
    severitySummary: String(raw.severitySummary ?? raw.title ?? raw.description ?? raw.locationName ?? "No summary"),
    priorityScore: Number(raw.priorityScore ?? raw.severity ?? 0),
    confidence: mapConfidence(raw.confidence),
    neededSkills: raw.neededSkills ?? [],
    status: mapStatus(raw.status),
    needsHumanReview: raw.needsHumanReview ?? false,
    updatedAt: Number(raw.updatedAt ?? raw.timestamp?.seconds ?? Date.now()),
    locationName: String(raw.locationName ?? ""),
  };
}

export function useFirestoreIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Firestore] Subscribing to incidents collection...");
    const incidentsRef = collection(db, "incidents");

    const unsubscribe = onSnapshot(
      incidentsRef,
      (snapshot) => {
        console.log(`[Firestore] Received ${snapshot.docs.length} documents`);
        const raw = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (raw.length > 0) {
          console.log("[Firestore] First doc sample:", JSON.stringify(raw[0], null, 2));
        }

        const data = raw.map(normalizeDoc);
        const withLoc = data.filter((d) => d.centerLocation.lat !== 0 && d.centerLocation.lng !== 0);
        console.log(`[Firestore] ${withLoc.length} of ${data.length} have valid location`);

        data.sort((a, b) => b.priorityScore - a.priorityScore);
        setIncidents(data);
        setLoading(false);
      },
      (err) => {
        console.error("[Firestore] Snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { incidents, loading };
}

export function useFirestoreTopPriority(limit = 3) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const incidentsRef = collection(db, "incidents");

    const unsubscribe = onSnapshot(incidentsRef, (snapshot) => {
      const raw = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const data = raw.map(normalizeDoc);
      data.sort((a, b) => b.priorityScore - a.priorityScore);
      setIncidents(data.slice(0, limit));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limit]);

  return { incidents, loading };
}