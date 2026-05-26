import { useEffect, useState } from 'react'

import {
  FaUsers,
  FaUserCheck,
  FaBuilding,
  FaClipboardCheck,
} from 'react-icons/fa'

import StatisticsCard from '../../components/employee/StatisticsCard/StatisticsCard'
import DepartmentChart from '../../components/analytics/DepartmentChart'

import { fetchEmployees } from '../../services/employeeService'

import './Dashboard.css'

const Dashboard = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const data = await fetchEmployees()

        // SAFE fallback
        setEmployees(Array.isArray(data) ? data : [])

        setError('')
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to load dashboard data')
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // ---------------------------
  // LOADING STATE
  // ---------------------------
  if (loading) {
    return (
      <div className="status-container">
        <h2>Loading Dashboard...</h2>
      </div>
    )
  }

  // ---------------------------
  // ERROR STATE
  // ---------------------------
  if (error) {
    return (
      <div className="status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  // ---------------------------
  // SAFE CALCULATIONS
  // ---------------------------
  const totalEmployees = employees.length

  const activeEmployees = employees.filter(
    (emp) => emp?.status === 'Active'
  ).length

  const departmentsCount = [
    ...new Set(
      employees.map((emp) => emp?.department).filter(Boolean)
    ),
  ].length

  const attendancePercentage =
    totalEmployees === 0
      ? 0
      : Math.round((activeEmployees / totalEmployees) * 100)

  // ---------------------------
  // RECENT EMPLOYEES (SAFE)
  // ---------------------------
  const recentEmployees = employees
    .slice()
    .reverse()
    .slice(0, 5)

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Employee Analytics Overview</p>
      </div>

      {/* STATS CARDS */}
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
          value={departmentsCount}
          icon={<FaBuilding />}
        />

        <StatisticsCard
          title="Attendance %"
          value={`${attendancePercentage}%`}
          icon={<FaClipboardCheck />}
        />
      </div>

      {/* ANALYTICS SECTION */}
      <div className="analytics-section">

        <DepartmentChart employees={employees} />

        <div className="attendance-card">
          <h3>Attendance Overview</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>

          <p>{attendancePercentage}% Employees Present</p>
        </div>

      </div>

      {/* RECENT EMPLOYEES */}
      <div className="recent-employees-card">

        <h3>Recent Employees</h3>

        {recentEmployees.length === 0 ? (
          <p>No employees found</p>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentEmployees.map((emp, index) => (
                <tr key={emp.id || index}>
                  <td>{emp?.name}</td>
                  <td>{emp?.department}</td>
                  <td>
                    <span
                      className={
                        emp?.status === 'Active'
                          ? 'status-active'
                          : 'status-inactive'
                      }
                    >
                      {emp?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  )
}

export default Dashboard