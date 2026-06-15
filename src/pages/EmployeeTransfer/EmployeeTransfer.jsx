import { useEffect, useState } from 'react'
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaBell,
  FaFileAlt,
} from 'react-icons/fa'
import { toast } from 'react-toastify'

import {
  fetchEmployees,
  updateEmployee,
} from '../../services/employeeService'
import {
  transferEmployee,
  fetchAuditLogs,
  fetchNotifications,
} from '../../services/transferService'

import './EmployeeTransfer.css'

const currentUser =
  JSON.parse(
    localStorage.getItem('currentUser')
  ) ||
  JSON.parse(
    localStorage.getItem('user')
  ) ||
  {}

const userCompanyId =
  currentUser.companyId

const departments = [
  'Engineering',
  'Finance',
  'HR',
  'Operations',
  'Marketing',
  'Sales',
  'Support',
  'Design',
]

const EmployeeTransfer = () => {
  const [employees, setEmployees] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] = useState('')

  // Form state
  const [selectedEmployee, setSelectedEmployee] =
    useState(null)

  const [toDepartment, setToDepartment] =
    useState('')

  const [reason, setReason] = useState('')

  // Table data
  const [recentTransfers, setRecentTransfers] =
    useState([])

  const [auditLogs, setAuditLogs] =
    useState([])

  const [notifications, setNotifications] =
    useState([])

  const [transferring, setTransferring] =
    useState(false)

  const currentUserId =
    currentUser?.id ||
    currentUser?._id ||
    currentUser?.user_id ||
    null

  const currentUserEmail =
    currentUser?.email ||
    currentUser?.user_email ||
    null

  /* =========================
     LOAD EMPLOYEES
  ========================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const empData =
          await fetchEmployees()

        setEmployees(
          Array.isArray(empData)
            ? empData
            : []
        )

        const logs =
          await fetchAuditLogs(
            userCompanyId
          )

        setAuditLogs(
          Array.isArray(logs) ? logs : []
        )

        const notifs =
          await fetchNotifications(
            currentUserId
          )

        setNotifications(
          Array.isArray(notifs)
            ? notifs
            : []
        )

        setError('')
      } catch (err) {
        console.error(
          'Load Error:',
          err
        )
        setError(
          err?.response?.data?.message ||
          'Failed to load data'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  /* =========================
     EXTRACT RECENT TRANSFERS
  ========================= */
  useEffect(() => {
    if (auditLogs.length > 0) {
      const transfers =
        auditLogs
          .filter(log =>
            log.action &&
            log.action.includes('Transferred')
          )
          .sort(
            (a, b) =>
              new Date(b.timestamp) -
              new Date(a.timestamp)
          )
          .slice(0, 10)

      setRecentTransfers(
        transfers
      )
    }
  }, [auditLogs])

  /* =========================
     GET TRANSFER NOTIFICATIONS
  ========================= */
  const transferNotifications =
    notifications.filter(
      notif =>
        notif.type ===
        'employee_transferred'
    )

  /* =========================
     HANDLE TRANSFER
  ========================= */
  const handleTransfer = async () => {
    if (
      !selectedEmployee ||
      !toDepartment ||
      toDepartment ===
      selectedEmployee.department
    ) {
      toast.warning('Please select a valid transfer')
      return
    }

    if (
      toDepartment ===
      selectedEmployee.department
    ) {
      toast.warning('Employee is already in that department')
      return
    }

    setTransferring(true)

    try {
      const updatedEmployeeData = {
        name: selectedEmployee.name,
        department: toDepartment,
        designation:
          selectedEmployee.designation,
        email: selectedEmployee.email,
        status: selectedEmployee.status,
        company_id:
          selectedEmployee.company_id ||
          userCompanyId,
      }

      await updateEmployee(
        selectedEmployee._id ||
        selectedEmployee.employee_id ||
        selectedEmployee.id,
        updatedEmployeeData,
        currentUser.email
      )

      const oldNotifications =
        JSON.parse(
          localStorage.getItem(
            'notifications'
          )
        ) || []

      const currentUserId =
        currentUser?.id ||
        currentUser?._id ||
        currentUser?.user_id ||
        null
      const currentUserEmail =
        currentUser?.email ||
        currentUser?.user_email ||
        null

      const newNotification = {
        id: Date.now(),
        type: 'employee_transferred',
        recipient_user_id: currentUserId,
        recipient_email: currentUserEmail,
        is_read: false,
        created_at: new Date().toISOString(),
        message: `${selectedEmployee.name} transferred from ${selectedEmployee.department} to ${toDepartment}`,
        payload: {
          employee_name: selectedEmployee.name,
          from_department: selectedEmployee.department,
          to_department: toDepartment,
        },
        time: 'Just now',
      }

      localStorage.setItem(
        'notifications',
        JSON.stringify([
          newNotification,
          ...oldNotifications,
        ])
      )

      window.dispatchEvent(
        new Event(
          'notification-update'
        )
      )

      // Reload data
      const empData =
        await fetchEmployees()

      setEmployees(
        Array.isArray(empData)
          ? empData
          : []
      )

      const logs =
        await fetchAuditLogs(
          userCompanyId
        )

      setAuditLogs(
        Array.isArray(logs)
          ? logs
          : []
      )

      const notifs =
        await fetchNotifications(
          currentUserId
        )

      setNotifications(
        Array.isArray(notifs)
          ? notifs
          : []
      )

      // Reset form
      setSelectedEmployee(null)
      setToDepartment('')
      setReason('')

      toast.success('Employee transferred successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to transfer employee')
    } finally {
      setTransferring(false)
    }
  }

  /* =========================
     FORMAT DATE
  ========================= */
  const formatDate = dateStr => {
    if (!dateStr) return '-'
    try {
      const date =
        new Date(dateStr)

      return date.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      )
    } catch (e) {
      return dateStr
    }
  }

  /* =========================
     PARSE TRANSFER FROM AUDIT
  ========================= */
  const extractTransferInfo =
    logAction => {
      const match =
        logAction?.match(
          /Transferred \((\w+)\s*→\s*(\w+)\)/
        )

      if (match) {
        return {
          from: match[1],
          to: match[2],
        }
      }

      return null
    }

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="status-container">
        <h2>
          Loading transfer data...
        </h2>
      </div>
    )
  }

  /* =========================
     ERROR
  ========================= */
  if (error) {
    return (
      <div className="status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="transfer-center-page">
      {/* Header */}
      <div className="transfer-header">
        <h1>
          🟦 Employee Transfer Center
        </h1>

        <p>
          Manage employee department
          transfers
        </p>
      </div>

      {/* Main Grid */}
      <div className="transfer-grid">
        {/* Left: Transfer Form + Notifications */}
        <div className="transfer-left">
          {/* Transfer Form */}
          <div className="transfer-form-section">
            <h2>🟪 Transfer Employee</h2>

            <div className="form-group">
              <label>Employee Name</label>

              <select
                value={
                  selectedEmployee
                    ? selectedEmployee.id ||
                      selectedEmployee
                        .employee_id
                    : ''
                }
                onChange={e => {
                  const emp =
                    employees.find(
                      employee =>
                        (
                          employee.id ||
                          employee.employee_id
                        ).toString() ===
                        e.target.value
                    )

                  setSelectedEmployee(
                    emp
                  )

                  setToDepartment('')
                }}
                className="form-select"
              >
                <option value="">
                  Select Employee
                </option>

                {employees.map(emp => (
                  <option
                    key={
                      emp.id ||
                      emp.employee_id
                    }
                    value={
                      emp.id ||
                      emp.employee_id
                    }
                  >
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee && (
              <>
                <div className="form-group">
                  <label>
                    Current Department
                  </label>

                  <div className="current-dept">
                    {
                      selectedEmployee.department
                    }
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Transfer To
                  </label>

                  <select
                    value={
                      toDepartment
                    }
                    onChange={e =>
                      setToDepartment(
                        e.target
                          .value
                      )
                    }
                    className="form-select"
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map(
                      dept => (
                        <option
                          key={dept}
                          value={dept}
                          disabled={
                            dept ===
                            selectedEmployee
                              .department
                          }
                        >
                          {dept}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Reason</label>

                  <textarea
                    value={
                      reason
                    }
                    onChange={e =>
                      setReason(
                        e.target
                          .value
                      )
                    }
                    placeholder="Enter transfer reason"
                    className="form-textarea"
                    rows={4}
                  />
                </div>

                <button
                  onClick={
                    handleTransfer
                  }
                  disabled={
                    transferring ||
                    !toDepartment
                  }
                  className="btn-transfer"
                >
                  {transferring ? (
                    'Transferring...'
                  ) : (
                    <>
                      🟦 Transfer
                      Employee
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Notifications */}
          {
            transferNotifications.length >
            0 && (
              <div className="transfer-notifications">
                <h3>
                  🔔 Transfer Notifications
                </h3>

                <div className="notif-list">
                  {
                    transferNotifications
                      .slice(0, 5)
                      .map(notif => {
                        let parsed = null

                        try {
                          if (notif.payload) {
                            parsed =
                              typeof notif.payload ===
                              'string'
                                ? JSON.parse(
                                    notif.payload
                                  )
                                : notif.payload
                          }
                        } catch (e) {
                          parsed = null
                        }

                        const fromDept =
                          parsed?.from_department ||
                          parsed?.from ||
                          'Unknown'
                        const toDept =
                          parsed?.to_department ||
                          parsed?.to ||
                          'Unknown'
                        const employeeName =
                          parsed?.employee_name ||
                          notif.message ||
                          'You'
                        const transferText =
                          parsed &&
                          (notif.recipient_user_id ===
                            currentUser?.id ||
                            notif.recipient_email ===
                              currentUser?.email)
                            ? 'You have been transferred'
                            : `${employeeName} has been transferred`

                        return (
                          <div
                            key={notif.id}
                            className="notif-item"
                          >
                            <div className="notif-card-top">
                              <span className="notif-type">
                                🟦 Department Transfer
                              </span>
                              <span className="notif-badge">
                                {notif.time || 'Just now'}
                              </span>
                            </div>

                            <p className="notif-message">
                              {transferText}
                            </p>

                            <div className="notif-departments">
                              <span className="notif-dept from">
                                🟣 {fromDept}
                              </span>
                              <span className="notif-arrow">
                                ➜
                              </span>
                              <span className="notif-dept to">
                                🔵 {toDept}
                              </span>
                            </div>
                          </div>
                        )
                      })
                  }
                </div>
              </div>
            )
          }
        </div>

        {/* Right: Recent Transfers + Audit Log */}
        <div className="transfer-right">
          {/* Recent Transfers Table */}
          {
            recentTransfers.length >
            0 && (
              <div className="recent-transfers-section">
                <h2>
                  🟩 Recent Transfers
                </h2>

                <div className="transfers-table-container">
                  <table className="transfers-table">
                    <thead>
                      <tr>
                        <th>Employee</th>

                        <th>From</th>

                        <th>To</th>

                        <th>Date</th>

                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {
                        recentTransfers.map(
                          (log, idx) => {
                            const info =
                              extractTransferInfo(
                                log.action
                              )

                            return (
                              <tr
                                key={
                                  idx
                                }
                              >
                                <td className="emp-name">
                                  {
                                    log.related_user ||
                                    'N/A'
                                  }
                                </td>

                                <td>
                                  {info
                                    ? info.from
                                    : '-'}
                                </td>

                                <td>
                                  {info
                                    ? info.to
                                    : '-'}
                                </td>

                                <td className="date">
                                  {formatDate(
                                    log.timestamp
                                  )}
                                </td>

                                <td className="status">
                                  <span className="status-done">
                                    <FaCheckCircle />{' '}
                                    Done
                                  </span>
                                </td>
                              </tr>
                            )
                          }
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }

          {/* Audit Log */}
          {
            auditLogs.length > 0 && (
              <div className="audit-log-section">
                <h2>
                  📋 Audit Log (Last 5)
                </h2>

                <div className="audit-list">
                  {
                    auditLogs
                      .filter(log =>
                        log.action &&
                        log.action.includes(
                          'Transferred'
                        )
                      )
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (log, idx) => {
                          const info =
                            extractTransferInfo(
                              log.action
                            )

                          return (
                            <div
                              key={
                                idx
                              }
                              className="audit-item"
                            >
                              <p className="audit-label">
                                Employee :
                              </p>

                              <p className="audit-value">
                                {
                                  log.related_user
                                }
                              </p>

                              <p className="audit-label">
                                Transfer :
                              </p>

                              <p className="audit-value">
                                {info
                                  ? `${info.from} ➜ ${info.to}`
                                  : 'N/A'}
                              </p>

                              <p className="audit-label">
                                By :
                              </p>

                              <p className="audit-value">
                                {
                                  log.performed_by
                                }
                              </p>

                              <p className="audit-label">
                                Date :
                              </p>

                              <p className="audit-value">
                                {formatDate(
                                  log.timestamp
                                )}
                              </p>

                              <hr />
                            </div>
                          )
                        }
                      )
                  }
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default EmployeeTransfer
