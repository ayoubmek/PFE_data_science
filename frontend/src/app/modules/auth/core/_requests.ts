import axios from 'axios'
import { AuthModel, UserModel } from './_models'

const API_URL = process.env.REACT_APP_API_URL

export const LOGIN_URL = `${API_URL}/auth/login`

export function login(username: string, password: string) {
  return axios.post<AuthModel & { user: UserModel }>(LOGIN_URL, { username, password })
}

export function getUserByToken(token: string) {
  // Spring Boot backend does not implement /api/auth/me.
  // We resolve a mock user session preserving the actual JWT token to authorize subsequent API requests.
  return Promise.resolve({
    data: {
      id: 1,
      username: 'admin',
      email: 'admin@optiprod.com',
      first_name: 'Admin',
      last_name: '',
      roles: ['admin', 'super admin'],
      api_token: token
    } as any
  })
}

export function refreshToken() {
  return axios.post<AuthModel>(`${API_URL}/auth/refresh`)
}

export function logout() {
  return axios.post(`${API_URL}/auth/logout`)
}

export function sellerLogin(username: string, password: string) {
  return axios.post<AuthModel & { user: UserModel }>(`${API_URL}/seller/login`, { username, password })
}

export function register(
  email: string, firstname: string, lastname: string,
  password: string, password_confirmation: string
) {
  return axios.post(`${API_URL}/register`, {
    email, first_name: firstname, last_name: lastname, password, password_confirmation,
  })
}

export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(`${API_URL}/forgot_password`, { email })
}
