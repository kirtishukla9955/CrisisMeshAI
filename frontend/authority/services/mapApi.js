// src/services/mapApi.js
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export async function fetchClusteredIncidents(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}/incidents/clustered${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch map data: ${response.status}`);
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : data.clusters ?? [];
}