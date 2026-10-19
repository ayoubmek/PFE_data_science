import { isAxiosError } from 'axios'

export const API_BASE_URL: string =
  process.env.REACT_APP_API_URL || 'http://localhost:8081/api'

interface ApiErrorBody {
  detail?: string
  message?: string
  error?: string
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return fallback
  const data: unknown = err.response?.data
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as ApiErrorBody
      return parsed.detail || parsed.message || parsed.error || fallback
    } catch {
      return data || fallback
    }
  }
  const body = (data ?? {}) as ApiErrorBody
  return body.detail || body.message || body.error || fallback
}
