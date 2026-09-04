import { api } from './api';

export const incidentService = {
  list: (filters = {}) => api.get('/incidents', filters),

  getIncident: (id) => api.get(`/incidents/${id}`),

  getIncidentReports: (id) => api.get(`/incidents/${id}/reports`),

  getIncidentHistory: (id) => api.get(`/incidents/${id}/history`),

  updateStatus: (id, status, authorityNote) =>
    api.patch(`/incidents/${id}/status`, { status, authorityNote }),

  addNote: (id, note) => api.post(`/incidents/${id}/notes`, { note }),

  assignResponder: (id, responderId, responderName) =>
    api.post(`/incidents/${id}/assign`, { responderId, responderName }),
};
