import type {AxiosError, AxiosStatic} from 'axios'
import {AuthModel} from './_models'

const AUTH_LOCAL_STORAGE_KEY = 'kt-auth-react-v'
const getAuth = (): AuthModel | undefined => {
  if (!localStorage) {
    return
  }

  const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)
  if (!lsValue) {
    return
  }

  try {
    const auth: AuthModel = JSON.parse(lsValue) as AuthModel
    if (auth) {

      return auth
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error)
  }
}

const setAuth = (auth: AuthModel) => {
  if (!localStorage) {
    return
  }

  try {
    const lsValue = JSON.stringify(auth)
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, lsValue)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE SAVE ERROR', error)
  }
}

const removeAuth = () => {
  if (!localStorage) {
    return
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error)
  }
}

export function setupAxios(axios: AxiosStatic) {
  axios.defaults.headers.common.Accept = 'application/json'
  axios.interceptors.request.use(
    (config) => {
      const token = getAuth()?.api_token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (err: unknown) => Promise.reject(err)
  )
  axios.interceptors.response.use(
    (response) => response,
    (err: AxiosError) => {
      const isLoginCall = String(err.config?.url || '').endsWith('/auth/login')
      if (err.response?.status === 401 && !isLoginCall && getAuth()) {
        removeAuth()
        window.location.assign('/auth/login')
      }
      return Promise.reject(err)
    }
  )
}

export {getAuth, setAuth, removeAuth, AUTH_LOCAL_STORAGE_KEY}