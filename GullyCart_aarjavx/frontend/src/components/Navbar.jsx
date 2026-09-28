import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function Navbar() {
  const navClass = ({ isActive }) => isActive ? 'active font-semibold' : ''
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const dashboardPath = user?.role === 'vendor'
    ? '/vendor/dashboard'
    : user?.role === 'admin'
      ? '/admin/dashboard'
      : '/user/dashboard'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4 md:px-8">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-square lg:hidden" aria-label="Open navigation menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8M4 18h16" /></svg>
          </div>
          <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow-lg">
            <li><NavLink to="/" className={navClass}>Home</NavLink></li>
            {token && <li><NavLink to={dashboardPath} className={navClass}>Dashboard</NavLink></li>}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl tracking-tight"><span className="badge badge-success text-base-100 font-bold">G</span> GullyCart</Link>
      </div>
      <nav className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 px-1">
          <li><NavLink to="/" className={navClass}>Home</NavLink></li>
          {token && <li><NavLink to={dashboardPath} className={navClass}>Dashboard</NavLink></li>}
        </ul>
      </nav>
      <div className="navbar-end gap-2">
        {token ? <button type="button" onClick={handleLogout} className="btn btn-error btn-sm">Log out</button> : <><Link to="/login" className="btn btn-ghost btn-sm">Log in</Link><Link to="/signup" className="btn btn-success btn-sm">Sign up</Link></>}
      </div>
    </header>
  )
}

export default Navbar