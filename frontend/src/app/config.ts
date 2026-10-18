/**
 * Application Global Configuration
 * Centralizes the backend API URL. The frontend never calls the ML service directly:
 * every request goes through the authenticated Spring Boot API (/api/ml/**).
 */

export const API_BASE_URL: string =
  process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

/** Common helper: readable message from an API error (backend or ML service). */
export function apiErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return parsed.detail || parsed.message || parsed.error || fallback
    } catch {
      return data || fallback
    }
  }
  return data?.detail || data?.message || data?.error || fallback
}

export default {
  API_BASE_URL,
}
