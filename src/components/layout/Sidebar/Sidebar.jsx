import { NavLink } from 'react-router-dom'

import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaClipboardCheck,
  FaCog,
} from 'react-icons/fa'

import './Sidebar.css'

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="logo">EMS</h2>

      <nav>
        <NavLink to="/dashboard">
          <FaHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/employees">
          <FaUsers />
          <span>Employees</span>
        </NavLink>

        <NavLink to="/departments">
          <FaBuilding />
          <span>Departments</span>
        </NavLink>

        <NavLink to="/attendance">
          <FaClipboardCheck />
          <span>Attendance</span>
        </NavLink>

        <NavLink to="/settings">
          <FaCog />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>Enterprise EMS v1.0</p>
      </div>
    </aside>
  )
}

export default Sidebar