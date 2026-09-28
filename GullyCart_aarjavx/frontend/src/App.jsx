import './App.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Signup from './pages/Signup'
import Login from './pages/Login'
import VendorDashboard from './pages/VendorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserHomepage from './pages/UserHomepage'
import Layout from './components/Layout'
import { DashboardRedirect, PrivateRoute, PublicRoute, RoleRoute } from './components/RouteGuards'

function App() {

  return (
    <main>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicRoute />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route element={<RoleRoute roles={['vendor']} />}>
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            </Route>
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            <Route element={<RoleRoute roles={['user']} />}>
              <Route path="/user/dashboard" element={<UserHomepage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </main>
  )
}

export default App
