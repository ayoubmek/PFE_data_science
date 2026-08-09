

import { FC } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { ErrorsPage } from '../modules/errors/ErrorsPage'
import { Logout, AuthPage, useAuth } from '../modules/auth'
import { App } from '../App'

const { PUBLIC_URL } = process.env

const AppRoutes: FC = () => {
  const { currentUser } = useAuth()
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />
          {currentUser ? (
            <Route path='*' element={<PrivateRoutes />} />
          ) : (
            <>
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='*' element={<Navigate to='/auth/login' />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { AppRoutes }
