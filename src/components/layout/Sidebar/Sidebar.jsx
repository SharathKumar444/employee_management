import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaClipboardCheck,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa'

import { useAuth } from '../../../context/AuthContext'
import './Sidebar.css'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    isActive ? 'active-link' : 'nav-link'

  return (
    <aside className="sidebar">

      {/* Logo */}
      <h2 className="logo">EMS</h2>

      {/* User Info */}
      <div className="sidebar-user">
        <p className="role-badge">
          {user?.role ? user.role.toUpperCase() : 'USER'}
        </p>

       
      </div>

      {/* Navigation */}
      <nav className="nav-links">

        <NavLink to="/dashboard" className={linkClass}>
          <FaHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/employees" className={linkClass}>
          <FaUsers />
          <span>Employees</span>
        </NavLink>

        {/* Admin Only */}
        {user?.role === 'admin' && (
          <NavLink to="/departments" className={linkClass}>
            <FaBuilding />
            <span>Departments</span>
          </NavLink>
        )}
        <NavLink to="/Departments" className={linkClass}>
          <FaClipboardCheck />
          <span>Departments</span>
        </NavLink>

        <NavLink to="/attendance" className={linkClass}>
          <FaClipboardCheck />
          <span>Attendance</span>
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          <FaCog />
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* Footer */}
      <div className="sidebar-footer">

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          Logout
        </button>

        <p className="version">Enterprise EMS v1.0</p>
      </div>

    </aside>
  )
}

export default Sidebar