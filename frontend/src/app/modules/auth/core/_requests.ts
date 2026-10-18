import axios from 'axios'
import { UserModel } from './_models'
import { API_BASE_URL } from '../../../config'

export const LOGIN_URL = `${API_BASE_URL}/auth/login`
export const ME_URL = `${API_BASE_URL}/auth/me`

export interface LoginResponse {
  token: string
  username: string
  fullName: string
  email: string
  role: string
}

interface MeResponse {
  id: number
  username: string
  fullName: string
  email: string
  role: string
}

export function login(username: string, password: string) {
  return axios.post<LoginResponse>(LOGIN_URL, { username, password })
}

export function toUserModel(u: { id?: number; username: string; fullName: string; email: string; role: string }): UserModel {
  return {
    id: u.id ?? 0,
    username: u.username,
    email: u.email,
    first_name: u.fullName,
    last_name: '',
    fullname: u.fullName,
    roles: [u.role.toLowerCase()],
  }
}

/** Valide le jeton auprès du backend et retourne l'utilisateur réel associé. */
export async function getUserByToken(token: string): Promise<UserModel> {
  const { data } = await axios.get<MeResponse>(ME_URL, { headers: { Authorization: `Bearer ${token}` } })
  return toUserModel(data)
}
