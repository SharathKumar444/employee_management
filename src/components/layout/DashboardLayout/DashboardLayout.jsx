import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from '../Sidebar/Sidebar'
import Navbar from '../Navbar/Navbar'

import './DashboardLayout.css'

const DashboardLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="dashboard-layout">

      <div className={sidebarOpen ? 'sidebar-wrapper open' : 'sidebar-wrapper closed'}>
        <Sidebar />
      </div>

      <div className="dashboard-content">

        <Navbar toggleSidebar={toggleSidebar} />

        <main className="main-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default DashboardLayout