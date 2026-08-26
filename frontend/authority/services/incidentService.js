import { api } from './api';

export const incidentService = {
  list: (filters = {}) => api.get('/incidents', filters).then((d) => d.incidents),

  get: (id) => api.get(`/incidents/${id}`), // -> { incident, reports }

  updateStatus: (id, status, authorityNote) =>
    api.patch(`/incidents/${id}/status`, { status, authorityNote }).then((d) => d.incident),

  addNote: (id, note) => api.post(`/incidents/${id}/notes`, { note }).then((d) => d.incident),

  assignResponder: (id, responderId, responderName) =>
    api.post(`/incidents/${id}/assign`, { responderId, responderName }).then((d) => d.incident),

  getHistory: (id) => api.get(`/incidents/${id}/history`).then((d) => d.events),
};
