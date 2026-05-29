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
  const {
    currentUser,
    logout,
  } = useAuth()

  const navigate = useNavigate()

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    logout()

    localStorage.removeItem('user')

    navigate('/login')
  }

  /* =========================
     ACTIVE LINK
  ========================= */

  const linkClass = ({
    isActive,
  }) =>
    isActive
      ? 'active-link'
      : 'nav-link'

  return (
    <aside className="sidebar">

      {/* LOGO */}

      <div className="sidebar-top">

        <h2 className="logo">
          EMS
        </h2>

        <p className="logo-text">
          Enterprise Management
        </p>

      </div>

      {/* USER INFO */}

      <div className="sidebar-user">

        <div className="sidebar-avatar">
          {currentUser?.email
            ?.charAt(0)
            ?.toUpperCase() || 'U'}
        </div>

        <h3>
          {currentUser?.name ||
            currentUser?.email?.split(
              '@'
            )[0] ||
            'User'}
        </h3>

        <p className="role-badge">
          {currentUser?.role
            ? currentUser.role.toUpperCase()
            : 'USER'}
        </p>

      </div>

      {/* NAVIGATION */}

      <nav className="nav-links">

        {/* DASHBOARD */}

        <NavLink
          to="/dashboard"
          className={linkClass}
        >
          <FaHome />

          <span>
            Dashboard
          </span>
        </NavLink>

        {/* EMPLOYEES */}

        <NavLink
          to="/employees"
          className={linkClass}
        >
          <FaUsers />

          <span>
            Employees
          </span>
        </NavLink>

        {/* ADMIN ONLY */}

        {currentUser?.role ===
          'admin' && (
          <>
            {/* DEPARTMENTS */}

            <NavLink
              to="/departments"
              className={
                linkClass
              }
            >
              <FaBuilding />

              <span>
                Departments
              </span>
            </NavLink>

            {/* ATTENDANCE */}

            <NavLink
              to="/attendance"
              className={
                linkClass
              }
            >
              <FaClipboardCheck />

              <span>
                Attendance
              </span>
            </NavLink>

            {/* SETTINGS */}

            <NavLink
              to="/settings"
              className={
                linkClass
              }
            >
              <FaCog />

              <span>
                Settings
              </span>
            </NavLink>
          </>
        )}

      </nav>

      {/* FOOTER */}

      <div className="sidebar-footer">

        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          <FaSignOutAlt />

          <span>
            Logout
          </span>

        </button>

        <p className="version">
          Enterprise EMS v1.0
        </p>

      </div>

    </aside>
  )
}

export default Sidebar