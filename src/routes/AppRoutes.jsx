import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from '../pages/Login/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import Employees from '../pages/Employees/Employees'
import Departments from '../pages/Departments/Departments'
import Attendance from '../pages/Attendance/Attendance'
import Settings from '../pages/Settings/Settings'

import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes