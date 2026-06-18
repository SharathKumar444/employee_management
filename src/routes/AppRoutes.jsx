import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'

// AUTH
import Login from '../pages/Login/Login'
import Signup from '../pages/Signup/Signup'
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'

// MAIN PAGES
import Dashboard from '../pages/Dashboard/Dashboard'
import Employees from '../pages/Employees/Employees'
import Departments from '../pages/Departments/Departments'
import Attendance from '../pages/Attendance/Attendance'
import Settings from '../pages/Settings/Settings'
import Companies from '../pages/Companies/Companies'
import AdminRoleRequests from '../pages/AdminRoleRequests/AdminRoleRequests'
import AuditLogs from '../pages/AuditLogs/AuditLogs'
import ActivityTracking from '../pages/ActivityTracking/ActivityTracking'
import Members from '../pages/Members/Members'
import Invitations from '../pages/Invitations/Invitations'
import AdminReactivationRequests from '../pages/AdminReactivationRequests/AdminReactivationRequests'
import AccountDeactivated from '../pages/AccountDeactivated/AccountDeactivated'
import Reactivation from '../pages/Reactivation/Reactivation'
import Notifications from '../pages/Notifications/Notifications'
import EmployeeTransfer from '../pages/EmployeeTransfer/EmployeeTransfer'
import DataExportCenter from '../pages/DataExportCenter/DataExportCenter'

// LAYOUT
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout'



const AppRoutes = () => {
  // eslint-disable-next-line no-unused-vars
  const { currentUser, loadingUser } = useAuth()

  // =========================
  // GLOBAL LOADING GUARD
  // =========================
  if (loadingUser) {
    return (
      <div className="status-container">
        <h2>Loading application...</h2>
      </div>
    )
  }

  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/account-deactivated" element={<AccountDeactivated />} />
      <Route path="/request-reactivation" element={<Reactivation />} />

      {/* =========================
          PROTECTED ROUTES
      ========================= */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="transfer" element={<EmployeeTransfer />} />
        <Route path="departments" element={<Departments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="companies" element={<Companies />} />
        <Route
          path="admin-role-requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRoleRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="activity-tracking"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ActivityTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="members"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="user-invitations"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Invitations />
            </ProtectedRoute>
          }
        />
        <Route
          path="reactivation-requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReactivationRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="data-export-center"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DataExportCenter />
            </ProtectedRoute>
          }
        />
        
        
      
          
        
        

   

      </Route>

    </Routes>
  )
}

export default AppRoutes