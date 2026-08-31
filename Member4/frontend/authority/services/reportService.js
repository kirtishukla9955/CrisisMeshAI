import { api } from './api';

export const reportService = {
  /** @param {{from?: string, to?: string}} period - ISO date strings; both optional (defaults to last 30 days server-side) */
  generate: (period = {}) => api.post('/post-disaster/report', period).then((d) => d.report),

  getLatest: () => api.get('/post-disaster/report/latest').then((d) => d.report),

  get: (id) => api.get(`/post-disaster/report/${id}`).then((d) => d.report),
};
