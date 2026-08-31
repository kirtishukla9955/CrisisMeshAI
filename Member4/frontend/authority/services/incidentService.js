import { api } from './api';

export const incidentService = {
  /** @param {{status?: string}} filters */
  list: (filters = {}) => api.get('/incidents', filters).then((d) => d.incidents),

  get: (id) => api.get(`/incidents/${id}`), // -> { incident, reports, suggestedVolunteerDetails }

  /** `note` is optional and is recorded on the audit trail only. */
  updateStatus: (id, status, note) =>
    api.patch(`/incidents/${id}/status`, { status, note }).then((d) => d.incident),

  addNote: (id, note) => api.post(`/incidents/${id}/notes`, { note }).then((d) => d.incident),

  /**
   * Confirms one of Member 3's suggestedVolunteers as the actual
   * assignment. Audit-only — does not add a field to the incident.
   */
  confirmVolunteer: (id, volunteerId, volunteerName) =>
    api.post(`/incidents/${id}/confirm-volunteer`, { volunteerId, volunteerName }).then((d) => d.incident),

  getHistory: (id) => api.get(`/incidents/${id}/history`).then((d) => d.events),
};
