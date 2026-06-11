import {
  useEffect,
  useState,
} from 'react'

import {
  FaDownload,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
} from 'react-icons/fa'

import { useAuth } from '../../context/AuthContext'
import {
  createAttendanceRequest,
  getAttendanceRequest,
  checkIn,
  checkOut,
  submitLeaveRequest,
} from '../../services/attendanceService'
import {
  getTodayAttendance,
  getAttendanceHistory,
} from '../../services/attendanceDataService'
import { getMyLeaveRequests } from '../../services/leaveService'

import './Attendance.css'

const Attendance = () => {
  const { currentUser } =
    useAuth()

  const hasAttendanceAccess =
    currentUser?.role === 'admin' ||
    currentUser?.attendance_access ||
    currentUser?.attendanceAccess

  const [attendanceRequest, setAttendanceRequest] =
    useState(null)

  const [
    attendance,
    setAttendance,
  ] = useState([])

  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [leaveRequests, setLeaveRequests] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [
    searchInput,
    setSearchInput,
  ] = useState('')

  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveType, setLeaveType] = useState('casual')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveStartDate, setLeaveStartDate] = useState('')
  const [leaveEndDate, setLeaveEndDate] = useState('')

  const loadTodayAttendance = async () => {
    if (!currentUser) return

    const companyId =
      currentUser.companyId || currentUser.company_id

    const result = await getTodayAttendance(
      currentUser.id,
      companyId
    )

    if (result?.success) {
      setTodayAttendance(result.data)
    } else {
      setTodayAttendance({
        status: 'not_started',
        check_in_time: null,
        check_out_time: null,
        working_hours: 0,
      })
    }
  }

  const loadAttendanceHistory = async () => {
    if (!currentUser) return

    const companyId =
      currentUser.companyId || currentUser.company_id

    const result = await getAttendanceHistory(
      currentUser.id,
      companyId
    )

    if (result?.success && Array.isArray(result.data)) {
      setAttendanceHistory(result.data)
    } else {
      setAttendanceHistory([])
    }
  }

  const loadLeaveRequests = async () => {
    if (!currentUser) return

    const companyId =
      currentUser.companyId || currentUser.company_id

    const result = await getMyLeaveRequests(
      currentUser.id,
      companyId
    )

    if (result?.success && Array.isArray(result.data)) {
      setLeaveRequests(result.data)
    } else {
      setLeaveRequests([])
    }
  }

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    const loadRequest = async () => {
      if (currentUser && !hasAttendanceAccess) {
        const existingRequest =
          getAttendanceRequest(currentUser)

        const request =
          existingRequest ||
          (await createAttendanceRequest(currentUser))

        setAttendanceRequest(request)
      }

      const data = [
        {
          id: 1,
          name:
            'Chelsey Dietrich',
          department:
            'Keebler LLC',
          date: '2026-05-21',
          status: 'On Leave',
        },
        {
          id: 2,
          name:
            'Clementina DuBuque',
          department:
            'Hoeger LLC',
          date: '2026-05-21',
          status: 'Active',
        },
        {
          id: 3,
          name:
            'Ervin Howell',
          department:
            'Deckow-Crist',
          date: '2026-05-21',
          status: 'Active',
        },
        {
          id: 4,
          name:
            'Glenna Reichert',
          department:
            'Yost and Sons',
          date: '2026-05-21',
          status: 'On Leave',
        },
        {
          id: 5,
          name:
            'Kurtis Weissnat',
          department:
            'Johns Group',
          date: '2026-05-21',
          status: 'Active',
        },
        {
          id: 6,
          name:
            'Leanne Graham',
          department:
            'Romaguera-Crona',
          date: '2026-05-21',
          status: 'Inactive',
        },
      ]

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttendance(data)

      if (currentUser && hasAttendanceAccess && currentUser.role !== 'admin') {
        await loadTodayAttendance()
        await loadAttendanceHistory()
        await loadLeaveRequests()
      }

      setLoading(false)
    }

    loadRequest()
  }, [currentUser, hasAttendanceAccess])

  /* =========================
     FILTER
  ========================= */

  const filteredAttendance =
    attendance.filter(item =>
      item.name
        .toLowerCase()
        .includes(
          searchInput.toLowerCase()
        )
    )

  /* =========================
     ATTENDANCE ACTIONS
  ========================= */

  const handleCheckIn = async () => {
    if (!currentUser) return
    try {
      const result = await checkIn(
        currentUser.id,
        currentUser.email,
        currentUser.companyId || currentUser.company_id
      )
      if (result.success) {
        alert('✅ Checked in successfully!')
        setTodayAttendance(result.data)
        loadAttendanceHistory()
      } else {
        alert(`⚠️ ${result.message}`)
      }
    } catch (error) {
      alert('❌ Error during check-in')
    }
  }

  const handleCheckOut = async () => {
    if (!currentUser) return
    try {
      const result = await checkOut(
        currentUser.id,
        currentUser.email,
        currentUser.companyId || currentUser.company_id
      )
      if (result.success) {
        alert('✅ Checked out successfully!')
        setTodayAttendance(result.data)
        loadAttendanceHistory()
      } else {
        alert(`⚠️ ${result.message}`)
      }
    } catch (error) {
      alert('❌ Error during check-out')
    }
  }

  const handleLeaveRequest = async () => {
    if (!leaveStartDate || !leaveEndDate) {
      alert('Please select dates')
      return
    }
    if (!currentUser) return
    try {
      const result = await submitLeaveRequest(
        currentUser.id,
        currentUser.email,
        currentUser.companyId || currentUser.company_id,
        leaveType,
        leaveStartDate,
        leaveEndDate,
        leaveReason
      )
      if (result.success) {
        alert(`✅ Leave request submitted! (ID: ${result.data?.id})`)
        setShowLeaveForm(false)
        setLeaveReason('')
        setLeaveStartDate('')
        setLeaveEndDate('')
        await loadLeaveRequests()
      } else {
        alert(`⚠️ ${result.message}`)
      }
    } catch (error) {
      alert('❌ Error submitting leave request')
    }
  }

  /* =========================
     FILTER
  ========================= */

  /* =========================
     DOWNLOAD CSV
  ========================= */

  const downloadCSV = () => {
    const headers = [
      'Employee',
      'Department',
      'Date',
      'Status',
    ]

    const rows =
      filteredAttendance.map(
        item => [
          item.name,
          item.department,
          item.date,
          item.status,
        ]
      )

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.join(',')
      ),
    ].join('\n')

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv',
      }
    )

    const url =
      window.URL.createObjectURL(
        blob
      )

    const link =
      document.createElement('a')

    link.href = url

    link.setAttribute(
      'download',
      'attendance-report.csv'
    )

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="status-container">
        <h2>
          Loading Attendance...
        </h2>
      </div>
    )
  }

  if (!hasAttendanceAccess) {
    return (
      <div className="status-container">
        <h2>Attendance Access Pending</h2>
        <p>
          Your account is not linked to an employee profile yet. A request has been sent to your company admin for approval.
        </p>
        {attendanceRequest && (
          <p>
            Submitted on:{' '}
            {new Date(
              attendanceRequest.createdAt
            ).toLocaleString()}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="attendance-page">

      {/* USER FEATURES */}

      {currentUser?.role !== 'admin' && (
        <div className="user-attendance-section">
          <div className="user-attendance-card">
            <h2>My Attendance</h2>
            
            <div className="check-in-out-buttons">
              <button 
                className="check-in-btn"
                onClick={handleCheckIn}
                disabled={todayAttendance?.check_in_time}
              >
                <FaClock /> Check In
              </button>
              <button 
                className="check-out-btn"
                onClick={handleCheckOut}
                disabled={!todayAttendance?.check_in_time || todayAttendance?.check_out_time}
              >
                <FaClock /> Check Out
              </button>
              <button 
                className="leave-request-btn"
                onClick={() => setShowLeaveForm(!showLeaveForm)}
              >
                <FaCalendarAlt /> Leave Request
              </button>
            </div>

            {todayAttendance && (
              <div className="today-attendance-summary">
                <p>
                  <strong>Today:</strong>{' '}
                  {todayAttendance.status?.replace('_', ' ') || 'Not Started'}
                </p>
                <p>
                  <strong>Check In:</strong>{' '}
                  {todayAttendance.check_in_time
                    ? new Date(todayAttendance.check_in_time).toLocaleTimeString()
                    : '--'}
                </p>
                <p>
                  <strong>Check Out:</strong>{' '}
                  {todayAttendance.check_out_time
                    ? new Date(todayAttendance.check_out_time).toLocaleTimeString()
                    : '--'}
                </p>
              </div>
            )}

            {showLeaveForm && (
              <div className="leave-form">
                <h3>Request Leave</h3>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="personal">Personal</option>
                  <option value="unpaid">Unpaid</option>
                </select>
                <input 
                  type="date" 
                  value={leaveStartDate}
                  onChange={(e) => setLeaveStartDate(e.target.value)}
                  placeholder="Start Date"
                />
                <input 
                  type="date" 
                  value={leaveEndDate}
                  onChange={(e) => setLeaveEndDate(e.target.value)}
                  placeholder="End Date"
                />
                <textarea 
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Reason (optional)"
                  rows="3"
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="submit-btn" onClick={handleLeaveRequest}>Submit</button>
                  <button className="cancel-btn" onClick={() => setShowLeaveForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {attendanceHistory.length > 0 && (
        <div className="recent-attendance-card">
          <h3>Recent Attendance</h3>
          <table className="recent-attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map(record => (
                <tr key={record.id}>
                  <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                  <td>{record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}</td>
                  <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '--'}</td>
                  <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {leaveRequests.length > 0 && (
        <div className="recent-attendance-card">
          <h3>Recent Leave Requests</h3>
          <table className="recent-attendance-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.leave_type?.charAt(0).toUpperCase() + request.leave_type?.slice(1)}</td>
                  <td>{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</td>
                  <td>{request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}</td>
                  <td>{request.reason || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* HEADER */}

      <div className="attendance-header">

        <div>

          <h1>
            Attendance Dashboard
          </h1>

          <p>
            Track employee
            attendance records
          </p>

        </div>

        {/* ADMIN ONLY DOWNLOAD */}

        {currentUser?.role ===
          'admin' && (
          <button
            className="download-btn"
            onClick={downloadCSV}
          >
            <FaDownload />
            Download Report
          </button>
        )}

      </div>

      {/* STATS */}

      <div className="attendance-stats">

        <div className="attendance-stat-card">

          <FaUserCheck className="attendance-icon active-icon" />

          <div>
            <h3>
              {
                attendance.filter(
                  item =>
                    item.status ===
                    'Active'
                ).length
              }
            </h3>

            <p>
              Present Employees
            </p>
          </div>

        </div>

        <div className="attendance-stat-card">

          <FaUserClock className="attendance-icon leave-icon" />

          <div>
            <h3>
              {
                attendance.filter(
                  item =>
                    item.status ===
                    'On Leave'
                ).length
              }
            </h3>

            <p>
              On Leave
            </p>
          </div>

        </div>

        <div className="attendance-stat-card">

          <FaUserTimes className="attendance-icon inactive-icon" />

          <div>
            <h3>
              {
                attendance.filter(
                  item =>
                    item.status ===
                    'Inactive'
                ).length
              }
            </h3>

            <p>
              Inactive Employees
            </p>
          </div>

        </div>

      </div>

      {/* SEARCH */}

      <div className="attendance-search">

        <input
          type="text"
          placeholder="Search employee..."
          value={searchInput}
          onChange={e =>
            setSearchInput(
              e.target.value
            )
          }
        />

      </div>

      {/* TABLE */}

      <div className="attendance-card">

        <table className="attendance-table">

          <thead>

            <tr>
              <th>
                Employee
              </th>

              <th>
                Department
              </th>

              <th>Date</th>

              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {filteredAttendance.map(
              item => (
                <tr key={item.id}>

                  <td>
                    {item.name}
                  </td>

                  <td>
                    {
                      item.department
                    }
                  </td>

                  <td>
                    {item.date}
                  </td>

                  <td>

                    <span
                      className={`status ${item.status
                        .toLowerCase()
                        .replace(
                          ' ',
                          '-'
                        )}`}
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Attendance