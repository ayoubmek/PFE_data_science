/**
 * Application Global Configuration
 * Centralizes backend API URLs and runtime constants.
 */

export const API_BASE_URL: string =
  process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

export const ML_SERVICE_URL: string =
  process.env.REACT_APP_ML_URL || 'http://localhost:8000';

export default {
  API_BASE_URL,
  ML_SERVICE_URL,
};
