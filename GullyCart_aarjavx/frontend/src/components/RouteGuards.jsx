import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function GuardLoading() {
  return <main className="min-h-screen grid place-items-center bg-base-200">Checking your session...</main>
}

export function PublicRoute() {
  const { hydrated, token, user } = useAuthStore()
  if (!hydrated) return <GuardLoading />
  if (token && user) return <Navigate replace to={user.role === 'vendor' ? '/vendor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/'} />
  return <Outlet />
}

export function PrivateRoute() {
  const { hydrated, token } = useAuthStore()
  const location = useLocation()
  if (!hydrated) return <GuardLoading />
  if (!token) return <Navigate replace state={{ from: location }} to="/login" />
  return <Outlet />
}

export function RoleRoute({ roles }) {
  const { user } = useAuthStore()
  if (!roles.includes(user?.role)) return <Navigate replace to="/dashboard" />
  return <Outlet />
}

export function DashboardRedirect() {
  const { user } = useAuthStore()
  if (user?.role === 'vendor') return <Navigate replace to="/vendor/dashboard" />
  if (user?.role === 'admin') return <Navigate replace to="/admin/dashboard" />
  return <Navigate replace to="/" />
}