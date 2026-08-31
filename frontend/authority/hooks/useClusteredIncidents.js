import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebaseClient"; // Ensure path matches your firebase export

export function useClusteredIncidents() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // Subscribe directly to the "incidents" collection
    const unsubscribe = onSnapshot(
      collection(db, "incidents"),
      (snapshot) => {
        const incidentsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Fallbacks covering both latitude/longitude and lat/lng formats
          const latitude = Number(data.latitude || data.lat || data.centerLocation?.lat || 0);
          const longitude = Number(data.longitude || data.lng || data.centerLocation?.lng || 0);

          return {
            id: doc.id,
            ...data,
            // Provide BOTH naming standards so components won't break:
            lat: latitude,
            lng: longitude,
            latitude: latitude,
            longitude: longitude,
            severity: Number(data.severity || data.priorityScore || 0),
            type: data.type || data.primaryTag || "Flood",
          };
        });

        setClusters(incidentsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Listener Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { clusters, loading, error };
}