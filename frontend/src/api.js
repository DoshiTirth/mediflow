import axios from 'axios';

const BASE = 'http://127.0.0.1:5000/api';

const api = axios.create({ baseURL: BASE });

export const getHealth         = ()       => api.get('/health');
export const getPatients       = (params) => api.get('/patients', { params });
export const getPatient        = (id)     => api.get(`/patients/${id}`);
export const getPatientVitals  = (id, params) => api.get(`/patients/${id}/vitals`, { params });
export const getPatientSummary = (id)     => api.post(`/patients/${id}/summary`);
export const getAnomalies      = (params) => api.get('/anomalies', { params });
export const getAnomalySummary = ()       => api.get('/anomalies/summary');
export const explainAnomaly    = (id)     => api.post(`/anomalies/${id}/explain`);
export const markReviewed      = (id)     => api.patch(`/anomalies/${id}/review`);
export const getVitalsStats    = ()       => api.get('/vitals/stats');
export const getAnomalyTrends = (period = 'monthly') => api.get('/anomalies/trends', { params: { period } });

export default api;