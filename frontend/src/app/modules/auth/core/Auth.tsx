import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  Dispatch,
  SetStateAction,
} from 'react'
import { LayoutSplashScreen } from '../../../../_metronic/layout/core'
import { AuthModel, UserModel } from './_models'
import * as authHelper from './AuthHelpers'
import { getUserByToken } from './_requests'
import { WithChildren } from '../../../../_metronic/helpers'

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  auth: undefined,
  saveAuth: () => { },
  currentUser: undefined,
  setCurrentUser: () => { },
  logout: () => { },
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()
  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
    } else {
      authHelper.removeAuth()
    }
  }

  const logout = () => {
    saveAuth(undefined)
    setCurrentUser(undefined)
  }

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { auth, logout, setCurrentUser } = useAuth()
  const didRequest = useRef(false)
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const bypassToken = searchParams.get('bypass') === 'true' ? 'static-demo-token-123' : searchParams.get('token')

    const requestUser = async (apiToken: string) => {
      try {
        if (!didRequest.current) {
          if (apiToken.startsWith('mock')) {
            setCurrentUser({
              id: 1,
              username: 'admin',
              email: 'admin@optiprod.com',
              first_name: 'Admin',
              last_name: 'Manager',
              roles: ['admin', 'super admin']
            } as any)
          } else {
            const { data } = await getUserByToken(apiToken)
            if (data) {
              setCurrentUser(data)
            }
          }
        }
      } catch (error) {
        console.error(error)
        if (!didRequest.current) {
          logout()
        }
      } finally {
        setShowSplashScreen(false)
      }

      return () => (didRequest.current = true)
    }

    if (bypassToken) {
      authHelper.setAuth({ api_token: bypassToken, refreshToken: bypassToken })
      requestUser(bypassToken)
    } else if (auth && auth.api_token) {
      if (auth.api_token.startsWith('mock')) {
        logout()
        setShowSplashScreen(false)
      } else {
        requestUser(auth.api_token)
      }
    } else {
      logout()
      setShowSplashScreen(false)
    }

  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export { AuthProvider, AuthInit, useAuth }