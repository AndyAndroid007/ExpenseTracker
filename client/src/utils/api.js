import axios from 'axios';
import logger from './logger';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

// Inject Timezone Offset Minutes + IANA timezone headers into every request
api.interceptors.request.use((config) => {
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();
  const ianaTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  config.headers['x-timezone-offset-minutes'] = timezoneOffsetMinutes;
  config.headers['x-timezone'] = ianaTimezone;
  logger.debug({ url: config.url, method: config.method }, 'Axios request outgoing');
  return config;
}, (error) => {
  logger.error({ err: error }, 'Axios request interceptor error');
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  logger.debug({ url: response.config.url, status: response.status }, 'Axios response received');
  return response;
}, (error) => {
  const errorResponse = error.response ? { status: error.response.status, data: error.response.data } : 'Network Error';
  logger.error({ err: errorResponse, url: error.config?.url }, 'Axios response error');
  return Promise.reject(error);
});

export default api;
