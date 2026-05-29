import { useState } from 'react'

import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar/Sidebar'
import Navbar from './Navbar/Navbar'

import './MainLayout.css'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="main-layout">

      <Sidebar isOpen={sidebarOpen} />

      <div
        className={`main-content ${
          sidebarOpen
            ? 'sidebar-open'
            : 'sidebar-close'
        }`}
      >

        <Navbar
          toggleSidebar={toggleSidebar}
        />

        <div className="page-content">
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default MainLayout