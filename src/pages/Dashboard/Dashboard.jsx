import { useEffect, useState } from 'react'

import {
  FaUsers,
  FaUserCheck,
  FaBuilding,
  FaClipboardCheck,
  FaCalendarAlt,
  FaSyncAlt,
} from 'react-icons/fa'

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

import StatisticsCard from '../../components/employee/StatisticsCard/StatisticsCard'
import DepartmentChart from '../../components/analytics/DepartmentChart'
import RoleChart from '../../components/analytics/RoleChart'
import StatusChart from '../../components/analytics/StatusChart'

import AttendanceBarChart from '../../components/analytics/AttendanceBarChart'
import { fetchEmployees } from '../../services/employeeService'

import './Dashboard.css'

const Dashboard = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [date, setDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  const [pendingRequests, setPendingRequests] =
    useState(0)

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const employeeData =
        await fetchEmployees()

      setEmployees(
        Array.isArray(employeeData)
          ? employeeData
          : []
      )

      // temporary until API created
      setPendingRequests(5)

      setError('')
    } catch (err) {
      console.error(err)

      setError(
        'Failed to load dashboard data'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="status-container">
        <h2>Loading Dashboard...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  const totalEmployees =
    employees.length

  const activeEmployees =
    employees.filter(
      emp => emp?.status === 'Active'
    ).length

  const totalDepartments = [
    ...new Set(
      employees
        .map(emp => emp.department)
        .filter(Boolean)
    ),
  ].length

  // eslint-disable-next-line no-unused-vars
  const attendancePercentage =
    totalEmployees > 0
      ? Math.round(
          (activeEmployees /
            totalEmployees) *
            100
        )
      : 0

  const recentEmployees =
    employees.slice(-5).reverse()

  return (
    <div className="dashboard-container">

      {/* HEADER */}

      <div className="dashboard-top">

        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>
            Employee Analytics Overview
          </p>
        </div>

        <div className="dashboard-actions">

          <button
            className="refresh-btn"
            onClick={loadDashboardData}
          >
            <FaSyncAlt />
            Refresh
          </button>

          <div className="calendar-wrapper">

            <div
              className="calendar-input"
              onClick={() =>
                setShowCalendar(
                  !showCalendar
                )
              }
            >
              <FaCalendarAlt />
              <span>
                {date.toDateString()}
              </span>
            </div>

            {showCalendar && (
              <div className="calendar-popup">
                <Calendar
                  value={date}
                  onChange={selectedDate => {
                    setDate(selectedDate)
                    setShowCalendar(false)
                  }}
                />
              </div>
            )}

          </div>

        </div>

      </div>

      {/* KPI WIDGETS */}

      <div className="statistics-grid">

        <StatisticsCard
          title="Total Employees"
          value={totalEmployees}
          icon={<FaUsers />}
        />

        <StatisticsCard
          title="Active Employees"
          value={activeEmployees}
          icon={<FaUserCheck />}
        />

        <StatisticsCard
          title="Departments"
          value={totalDepartments}
          icon={<FaBuilding />}
        />

        <StatisticsCard
          title="Pending Requests"
          value={pendingRequests}
          icon={<FaClipboardCheck />}
        />

      </div>

      {/* CHARTS */}

      <div className="analytics-grid">

        <div className="chart-card">
          <h3>
            Employee Distribution
            by Department
          </h3>

          <DepartmentChart
            employees={employees}
          />
        </div>

        <div className="chart-card">
          <h3>
            Employee Count by Role
          </h3>

          <RoleChart
            employees={employees}
          />
        </div>

        <div className="chart-card">
          <h3>
            Employee Status Overview
          </h3>

          <StatusChart
            employees={employees}
          />
        </div>

      </div>

      {/* ATTENDANCE */}

     <div className="attendance-card">

  <h3>
    Attendance Overview
  </h3>

  <AttendanceBarChart
    totalEmployees={totalEmployees}
    activeEmployees={activeEmployees}
  />

</div>

      {/* RECENT EMPLOYEES */}

      <div className="recent-employees-card">

        <h3>Recent Employees</h3>

        <table className="recent-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {recentEmployees.map(emp => (
              <tr key={emp.id}>

                <td>{emp.name}</td>

                <td>
                  {emp.department}
                </td>

                <td>
                  <span
                    className={
                      emp.status ===
                      'Active'
                        ? 'status-active'
                        : 'status-inactive'
                    }
                  >
                    {emp.status}
                  </span>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Dashboard