import { Routes, Route } from 'react-router-dom'
 
import Login from '../pages/Login/Login'

import Signup from '../pages/Signup/Signup'

import Dashboard from '../pages/Dashboard/Dashboard'

import Employees from '../pages/Employees/Employees'
 
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout'
import Departments from '../pages/Departments/Departments'
import Attendance from '../pages/Attendance/Attendance'
import Settings from '../pages/Settings/Settings'
const AppRoutes = () => {
 
  return (
 
    <Routes>
 
      {/* Auth Pages */}
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
 
      {/* Dashboard Layout Routes */}
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
 
      </Route>
       <Route

          path="Departments"

          element={<Departments />}

        />
 
     <Route

          path="Attendance"

          element={<Attendance />}

        />
    <Route

          path="Settings"

          element={<Settings />}

        />
    </Routes>

  )

}
 
export default AppRoutes
 