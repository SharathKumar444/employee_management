import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Navbar from '../Navbar/Navbar'

import './DashboardLayout.css'

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout