import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useApp'

/** Every screen except the three auth pages is behind a session. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

