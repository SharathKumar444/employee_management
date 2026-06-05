import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login/Login'
import Signup from '../pages/Signup/Signup'
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'

import Dashboard from '../pages/Dashboard/Dashboard'
import Employees from '../pages/Employees/Employees'
import Departments from '../pages/Departments/Departments'
import Attendance from '../pages/Attendance/Attendance'
import Settings from '../pages/Settings/Settings'
import Companies from '../pages/Companies/Companies'
import AdminRoleRequests from '../pages/AdminRoleRequests/AdminRoleRequests'
import AuditLogs from '../pages/AuditLogs/AuditLogs'


import Invitations from '../pages/Invitations/Invitations'

import DeactivatedAccount from '../pages/DeactivatedAccount/DeactivatedAccount'

import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout'

const AppRoutes = () => {
  return (
    <Routes>

      {/* AUTH ROUTES */}

      <Route path="/" element={<Login />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* DEACTIVATED PAGE */}
      <Route
        path="/account-deactivated"
        element={<DeactivatedAccount />}
      />

      {/* DASHBOARD LAYOUT */}

      <Route
        path="/"
        element={<DashboardLayout />}
      >
        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="employees"
          element={<Employees />}
        />

        <Route
          path="departments"
          element={<Departments />}
        />

        <Route
          path="attendance"
          element={<Attendance />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

        <Route
          path="companies"
          element={<Companies />}
        />

        <Route
          path="admin-role-requests"
          element={<AdminRoleRequests />}
        />

        <Route
          path="audit-logs"
          element={<AuditLogs />}
        />

        

        <Route
          path="invitations"
          element={<Invitations />}
        />

        
      </Route>

    </Routes>
  )
}

export default AppRoutes