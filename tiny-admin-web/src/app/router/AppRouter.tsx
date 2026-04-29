import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from 'antd'
import { useAuthStore } from '../store/authStore'
import { LoginPage } from '../../features/auth/LoginPage'
import { AppShell } from '../../layouts/AppShell'

function ProtectedRoute() {
  const { user, bootstrap, bootstrapped } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!bootstrapped) {
      void bootstrap()
    }
  }, [bootstrap, bootstrapped])

  if (!bootstrapped) {
    return <Spin fullscreen />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <AppShell />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedRoute />} />
    </Routes>
  )
}
