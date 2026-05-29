import { Routes, Route } from 'react-router-dom'
 import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'
import Login from '../pages/Login/Login'
import Signup from '../pages/Signup/Signup'
 
import Dashboard from '../pages/Dashboard/Dashboard'
import Employees from '../pages/Employees/Employees'
import Departments from '../pages/Departments/Departments'
import Attendance from '../pages/Attendance/Attendance'
import Settings from '../pages/Settings/Settings'
 
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout'
 
const AppRoutes = () => {
  return (
<Routes>
 
      {/* AUTH ROUTES */}
<Route
        path="/"
        element={<Login />}
      />
 
      <Route
        path="/login"
        element={<Login />}
      />
 
      <Route
        path="/signup"
        element={<Signup />}
      />
 
      {/* DASHBOARD ROUTES */}
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
 
      </Route>

      <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
 
    </Routes>
  )
}
 
export default AppRoutes