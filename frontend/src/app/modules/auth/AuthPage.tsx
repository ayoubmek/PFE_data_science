import { Route, Routes, Navigate } from 'react-router-dom'
import { Login } from './components/Login'
import { AuthLayout } from './AuthLayout'

const AuthPage = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path='login' element={<Login />} />
      <Route path='forgot-password' element={<Navigate to='/auth/login' replace />} />
      <Route path='registration' element={<Navigate to='/auth/login' replace />} />
      <Route index element={<Navigate to='/auth/login' />} />
    </Route>
  </Routes>
)

export { AuthPage }