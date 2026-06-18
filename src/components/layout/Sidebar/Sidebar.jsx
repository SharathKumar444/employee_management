import { NavLink, useNavigate } from 'react-router-dom'

import {
  FaHome,
  FaUsers,
  FaEnvelope,
  FaBuilding,
  FaClipboardCheck,
  FaCog,
  FaSignOutAlt,
  FaCity,
  FaHistory,
  FaChartBar,
  FaArrowRight,
  FaDownload,
} from 'react-icons/fa'

import { useAuth } from '../../../context/AuthContext'

import './Sidebar.css'

const Sidebar = () => {
  const { currentUser, logout } = useAuth()

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('user')
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    isActive ? 'active-link' : 'nav-link'

  const role =
    currentUser?.role?.toLowerCase() || 'user'

  const companyMap = {
    COMP001: 'Company A',
    COMP002: 'Company B',
    COMP003: 'Company C',
  }

  const companyId =
    currentUser?.companyId ||
    currentUser?.company_id ||
    'COMP001'

  const companyName =
    currentUser?.companyName ||
    companyMap[companyId] ||
    'Company A'

  const userName =
    currentUser?.name ||
    currentUser?.email?.split('@')[0] ||
    'User'

  const userInitial =
    currentUser?.email?.charAt(0)?.toUpperCase() || 'U'

  return (
    <aside className="sidebar">

      {/* HEADER */}
      <div className="sidebar-top">
        <h2 className="logo">EMS</h2>
        <p className="logo-text">Enterprise Management</p>
      </div>

      {/* USER INFO */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {userInitial}
        </div>

        <h3>{userName}</h3>

        <p className="role-badge">
          {currentUser?.role?.toUpperCase() || 'USER'}
        </p>

        <p className="company-badge">
          {companyName}
        </p>

        <small className="company-id">
          {companyId}
        </small>
      </div>

      {/* NAVIGATION */}
 <nav className="nav-links">

  {/* DASHBOARD */}
  <NavLink to="/dashboard" className={linkClass}>
    <FaHome />
    <span>Dashboard</span>
  </NavLink>

  <NavLink to="/attendance" className={linkClass}>
    <FaClipboardCheck />
    <span>Attendance</span>
  </NavLink>

  {/* ADMIN ONLY */}
  {role === "admin" && (
    <>
      <NavLink to="/employees" className={linkClass}>
        <FaUsers />
        <span>Employees</span>
      </NavLink>

      <NavLink to="/transfer" className={linkClass}>
        <FaArrowRight />
        <span>Transfer</span>
      </NavLink>

      <NavLink to="/members" className={linkClass}>
        <FaUsers />
        <span>Members</span>
      </NavLink>

      <NavLink to="/user-invitations" className={linkClass}>
        <FaEnvelope />
        <span>Invitations</span>
      </NavLink>

      <NavLink to="/companies" className={linkClass}>
        <FaCity />
        <span>Companies</span>
      </NavLink>

      <NavLink to="/departments" className={linkClass}>
        <FaBuilding />
        <span>Departments</span>
      </NavLink>

      <NavLink to="/activity-tracking" className={linkClass}>
        <FaChartBar />
        <span>Activity Tracking</span>
      </NavLink>

      <NavLink to="/audit-logs" className={linkClass}>
        <FaHistory />
        <span>Audit Logs</span>
      </NavLink>

      <NavLink to="/data-export-center" className={linkClass}>
        <FaDownload />
        <span>Data Export</span>
      </NavLink>
    </>
  )}

  
  

  {/* SETTINGS */}
  <NavLink to="/settings" className={linkClass}>
    <FaCog />
    <span>Settings</span>
  </NavLink>

</nav>
      {/* FOOTER */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>

        <p className="version">
          Enterprise EMS v1.0
        </p>
      </div>

    </aside>
  )
}

export default Sidebar