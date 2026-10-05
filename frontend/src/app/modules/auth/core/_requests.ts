import axios from 'axios'
import { AuthModel, UserModel } from './_models'

const API_URL = process.env.REACT_APP_API_URL

export const LOGIN_URL = `${API_URL}/auth/login`

export function login(username: string, password: string) {
  return axios.post<AuthModel & { user: UserModel }>(LOGIN_URL, { username, password })
}

export function getUserByToken(token: string) {
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