import { api } from './api';

export const reportService = {
  generate: (eventId) => api.post('/post-disaster/report', eventId ? { eventId } : {}).then((d) => d.report),

  getLatest: () => api.get('/post-disaster/report/latest').then((d) => d.report),

  get: (id) => api.get(`/post-disaster/report/${id}`).then((d) => d.report),
};
