import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar/Sidebar'
import Navbar from './Navbar/Navbar'

import './MainLayout.css'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  return (
    <div className="main-layout">

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* MAIN CONTENT */}
      <div
        className={`main-content ${
          sidebarOpen
            ? 'sidebar-open'
            : 'sidebar-close'
        }`}
      >

        {/* NAVBAR */}
        <Navbar
          toggleSidebar={toggleSidebar}
        />

        {/* PAGE CONTENT */}
        <div className="page-content">
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default MainLayout