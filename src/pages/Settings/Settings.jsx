import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getReactivationRequests,
  approveRequest,
  rejectRequest,
} from '../../services/reactivationService'
import {
  getCompanyLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../../services/leaveService'

import './Settings.css'

import {
  FaBell,
  FaUser,
  FaDesktop,
  FaMoon,
  FaSun,
  FaUserShield,
  FaCalendarAlt,
} from 'react-icons/fa'

const Settings = () => {
  const { currentUser } = useAuth()

  const [darkMode, setDarkMode] =
    useState(false)

  const [password, setPassword] =
    useState('')

  const [adminEmail, setAdminEmail] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [pendingRequests, setPendingRequests] =
    useState([])

  const [pendingReactivationRequests, setPendingReactivationRequests] =
    useState([])

  const [pendingLeaveRequests, setPendingLeaveRequests] =
    useState([])

  const [loadingReactivation, setLoadingReactivation] =
    useState(false)

  const [processingReactivationId, setProcessingReactivationId] =
    useState(null)

  const [reactivationMessage, setReactivationMessage] =
    useState('')

  const companyId =
    currentUser?.companyId ||
    currentUser?.company_id


  useEffect(() => {
    const savedTheme =
      localStorage.getItem('theme')

    if (savedTheme === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDarkMode(true)

      document.body.classList.add(
        'dark-theme'
      )
    }

    // eslint-disable-next-line react-hooks/immutability
    loadPendingRequests()
    
    // Load reactivation requests if admin
    if (currentUser?.role === 'admin' && companyId) {
      // eslint-disable-next-line react-hooks/immutability
      loadReactivationRequests()
    }

    if (currentUser?.role === 'admin' && companyId) {
      // eslint-disable-next-line react-hooks/immutability
      loadPendingLeaveRequests()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, companyId])

  const loadReactivationRequests = async () => {
    try {
      setLoadingReactivation(true)
      const res = await getReactivationRequests(companyId)
      if (res?.success && res?.data) {
        const pending = res.data.filter(r => r.status === 'Pending')
        setPendingReactivationRequests(pending)
      }
    } catch (err) {
      console.error('Load reactivation requests error:', err)
    } finally {
      setLoadingReactivation(false)
    }
  }

  const loadPendingLeaveRequests = async () => {
    try {
      const res = await getCompanyLeaveRequests(companyId, 'pending')
      if (res?.success && Array.isArray(res.data)) {
        setPendingLeaveRequests(res.data)
      } else {
        setPendingLeaveRequests([])
      }
    } catch (err) {
      console.error('Load pending leave requests error:', err)
      setPendingLeaveRequests([])
    }
  }

  const loadPendingRequests = () => {
    const requests =
      JSON.parse(
        localStorage.getItem(
          'roleRequests'
        )
      ) || []

    const filtered =
      requests.filter(
        request =>
          request.adminEmail ===
            currentUser?.email &&
          request.status === 'pending'
      )

    setPendingRequests(filtered)
  }

  const handleApproveLeaveRequest = async (leaveId) => {
    try {
      const res = await approveLeaveRequest(
        leaveId,
        currentUser.email,
        companyId
      )
      if (res?.success) {
        await loadPendingLeaveRequests()
      } else {
        console.error('Approve leave request failed', res)
      }
    } catch (err) {
      console.error('Approve leave request error:', err)
    }
  }

  const handleRejectLeaveRequest = async (leaveId) => {
    try {
      const res = await rejectLeaveRequest(
        leaveId,
        currentUser.email,
        companyId
      )
      if (res?.success) {
        await loadPendingLeaveRequests()
      } else {
        console.error('Reject leave request failed', res)
      }
    } catch (err) {
      console.error('Reject leave request error:', err)
    }
  }

  const toggleTheme = () => {
    const newTheme = !darkMode

    setDarkMode(newTheme)

    if (newTheme) {
      document.body.classList.add(
        'dark-theme'
      )

      localStorage.setItem(
        'theme',
        'dark'
      )
    } else {
      document.body.classList.remove(
        'dark-theme'
      )

      localStorage.setItem(
        'theme',
        'light'
      )
    }
  }

  const handleRoleRequest = e => {
    e.preventDefault()

    if (!password) {
      setMessage(
        'Enter your password'
      )
      return
    }

    const users =
      JSON.parse(
        localStorage.getItem('users')
      ) || []

    const validUser =
      users.find(
        user =>
          user.email ===
            currentUser.email &&
          user.password === password
      )

    if (!validUser) {
      setMessage(
        'Incorrect password'
      )
      return
    }

    const admin =
      users.find(
        user =>
          user.email === adminEmail &&
          user.role === 'admin'
      )

    if (!admin) {
      setMessage(
        'Admin email not found'
      )
      return
    }

    const request = {
      id: Date.now(),
      userEmail:
        currentUser.email,
      userName:
        currentUser.name,
      adminEmail,
      currentRole: 'user',
      requestedRole: 'admin',
      status: 'pending',
      createdAt:
        new Date().toISOString(),
    }

    const requests =
      JSON.parse(
        localStorage.getItem(
          'roleRequests'
        )
      ) || []

    requests.push(request)

    localStorage.setItem(
      'roleRequests',
      JSON.stringify(requests)
    )

    const notifications =
      JSON.parse(
        localStorage.getItem(
          'notifications'
        )
      ) || []

    notifications.push({
      id: Date.now(),
      email: adminEmail,
      requestId: request.id,
      type: 'role-request',
      message: `${currentUser.name} requested Admin access`,
      time:
        new Date().toLocaleString(),
    })

    localStorage.setItem(
      'notifications',
      JSON.stringify(notifications)
    )

    window.dispatchEvent(
      new Event(
        'notification-update'
      )
    )

    setMessage(
      'Role change request submitted successfully.'
    )

    setPassword('')
    setAdminEmail('')
  }

  const approveRoleRequest = request => {
    const users =
      JSON.parse(
        localStorage.getItem('users')
      ) || []

    const updatedUsers =
      users.map(user => {
        if (
          user.email ===
          request.userEmail
        ) {
          return {
            ...user,
            role: 'admin',
          }
        }

        return user
      })

    localStorage.setItem(
      'users',
      JSON.stringify(updatedUsers)
    )

    const requests =
      JSON.parse(
        localStorage.getItem(
          'roleRequests'
        )
      ) || []

    const updatedRequests =
      requests.map(r =>
        r.id === request.id
          ? {
              ...r,
              status: 'approved',
            }
          : r
      )

    localStorage.setItem(
      'roleRequests',
      JSON.stringify(
        updatedRequests
      )
    )

    const notifications =
      JSON.parse(
        localStorage.getItem(
          'notifications'
        )
      ) || []

    notifications.push({
      // eslint-disable-next-line react-hooks/purity
      id: Date.now(),
      email:
        request.userEmail,
      message:
        'Your Admin role request has been approved',
      time:
        new Date().toLocaleString(),
    })

    localStorage.setItem(
      'notifications',
      JSON.stringify(notifications)
    )

    loadPendingRequests()
  }

  const rejectRoleRequest = request => {
    const requests =
      JSON.parse(
        localStorage.getItem(
          'roleRequests'
        )
      ) || []

    const updatedRequests =
      requests.map(r =>
        r.id === request.id
          ? {
              ...r,
              status: 'rejected',
            }
          : r
      )

    localStorage.setItem(
      'roleRequests',
      JSON.stringify(
        updatedRequests
      )
    )

    loadPendingRequests()
  }

  const handleApproveReactivation = async (requestId) => {
    const adminIdentifier = currentUser?.email || currentUser?.name

    if (!adminIdentifier) {
      setReactivationMessage('❌ Unable to determine admin identifier')
      return
    }

    const comment = window.prompt('Optional comment for this approval:')
    if (comment === null) return // User cancelled
    
    try {
      setProcessingReactivationId(requestId)
      setReactivationMessage('')
      
      console.log('Approving request:', { requestId, adminIdentifier, comment })
      const res = await approveRequest(requestId, adminIdentifier, comment)
      console.log('Approve response:', res)
      
      if (res?.success) {
        setReactivationMessage('✅ User reactivated successfully!')
        setTimeout(() => setReactivationMessage(''), 3000)
        await loadReactivationRequests()
      } else {
        const errorMsg = res?.message || res?.detail || 'Failed to reactivate user'
        setReactivationMessage('❌ ' + errorMsg)
        setTimeout(() => setReactivationMessage(''), 4000)
      }
    } catch (err) {
      console.error('Approve error:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to reactivate'
      setReactivationMessage('❌ ' + errorMsg)
      setTimeout(() => setReactivationMessage(''), 4000)
    } finally {
      setProcessingReactivationId(null)
    }
  }

  const handleRejectReactivation = async (requestId) => {
    const adminIdentifier = currentUser?.email || currentUser?.name

    if (!adminIdentifier) {
      setReactivationMessage('❌ Unable to determine admin identifier')
      return
    }

    const comment = window.prompt('Optional comment for this rejection:')
    if (comment === null) return // User cancelled
    
    try {
      setProcessingReactivationId(requestId)
      setReactivationMessage('')
      
      console.log('Rejecting request:', { requestId, adminIdentifier, comment })
      const res = await rejectRequest(requestId, adminIdentifier, comment)
      console.log('Reject response:', res)
      
      if (res?.success) {
        setReactivationMessage('✅ Request rejected successfully!')
        setTimeout(() => setReactivationMessage(''), 3000)
        await loadReactivationRequests()
      } else {
        const errorMsg = res?.message || res?.detail || 'Failed to reject request'
        setReactivationMessage('❌ ' + errorMsg)
        setTimeout(() => setReactivationMessage(''), 4000)
      }
    } catch (err) {
      console.error('Reject error:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to reject'
      setReactivationMessage('❌ ' + errorMsg)
      setTimeout(() => setReactivationMessage(''), 4000)
    } finally {
      setProcessingReactivationId(null)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>

        <p>
          Manage appearance,
          notifications, account
          preferences and role
          access.
        </p>
      </div>

      <div className="settings-grid">

        <div className="settings-card">
          <div className="card-title">
            <FaDesktop />
            <h3>Appearance</h3>
          </div>

          <p>
            Current theme:{' '}
            {darkMode
              ? 'Dark'
              : 'Light'}
          </p>

          <button
            className="icon-btn"
            onClick={toggleTheme}
          >
            {darkMode ? (
              <FaSun />
            ) : (
              <FaMoon />
            )}
          </button>
        </div>

        <div className="settings-card">
          <div className="card-title">
            <FaBell />
            <h3>Notifications</h3>
          </div>

          <label>
            <input
              type="checkbox"
              defaultChecked
            />
            Notify when employees
            are added or updated
          </label>
        </div>

        <div className="settings-card">
          <div className="card-title">
            <FaUser />
            <h3>Account</h3>
          </div>

          <div className="account-box">
            <div className="avatar">
              {currentUser?.name?.charAt(
                0
              ) || 'U'}
            </div>

            <div>
              <p className="name">
                {currentUser?.name}
              </p>

              <p className="email">
                {currentUser?.email}
              </p>

              <span className="role">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </div>

        {currentUser?.role ===
          'user' && (
          <div className="settings-card">
            <div className="card-title">
              <FaUserShield />
              <h3>
                Request Admin Role
              </h3>
            </div>

            <form
              onSubmit={
                handleRoleRequest
              }
              className="role-request-form"
            >
              <input
                type="password"
                placeholder="Current Password"
                value={password}
                onChange={e =>
                  setPassword(
                    e.target.value
                  )
                }
              />

              <input
                type="email"
                placeholder="Admin Email"
                value={adminEmail}
                onChange={e =>
                  setAdminEmail(
                    e.target.value
                  )
                }
              />

              <button
                type="submit"
                className="submit-btn"
              >
                Submit Request
              </button>
            </form>

            {message && (
              <p>
                {message}
              </p>
            )}
          </div>
        )}

        {currentUser?.role ===
          'admin' && (
          <>
          <div className="settings-card pending-requests">
            <div className="card-title">
              <FaUserShield />
              <h3>
                Pending Role
                Requests
              </h3>
            </div>

            {pendingRequests.length ===
            0 ? (
              <p>
                No pending requests
              </p>
            ) : (
              pendingRequests.map(
                request => (
                  <div
                    key={
                      request.id
                    }
                    className="request-item"
                  >
                    <h4>
                      {
                        request.userName
                      }
                    </h4>

                    <p>
                      {
                        request.userEmail
                      }
                    </p>

                    <div className="request-actions">
                      <button
                        onClick={() =>
                          approveRoleRequest(
                            request
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectRoleRequest(
                            request
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <div className="settings-card pending-reactivation-requests">
            <div className="card-title">
              <FaBell />
              <h3>
                Pending Reactivation
                Requests
              </h3>
            </div>

            {reactivationMessage && (
              <div className="reactivation-message">
                {reactivationMessage}
              </div>
            )}

            {loadingReactivation ? (
              <p>Loading requests...</p>
            ) : pendingReactivationRequests.length ===
            0 ? (
              <p>
                No pending reactivation requests.
              </p>
            ) : (
              pendingReactivationRequests.map(
                request => (
                  <div
                    key={request.id}
                    className="request-item reactivation"
                  >
                    <h4>
                      User #{request.user_id}
                    </h4>

                    <p className="request-email">
                      {request.user_email || 'N/A'} requested account reactivation.
                    </p>

                    {request.reason && (
                      <p className="request-message">
                        📝 {request.reason}
                      </p>
                    )}

                    <p className="request-date">
                      📅 {new Date(request.created_at).toLocaleString()}
                    </p>

                    <div className="request-actions">
                      <button
                        className="approve-btn"
                        onClick={() =>
                          handleApproveReactivation(
                            request.id
                          )
                        }
                        disabled={
                          processingReactivationId === request.id
                        }
                      >
                        {processingReactivationId === request.id
                          ? '⏳ Processing...'
                          : '✓ Reactivate'}
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() =>
                          handleRejectReactivation(
                            request.id
                          )
                        }
                        disabled={
                          processingReactivationId === request.id
                        }
                      >
                        {processingReactivationId === request.id
                          ? '⏳ Processing...'
                          : '✕ Reject'}
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <div className="settings-card pending-leave-requests">
            <div className="card-title">
              <FaCalendarAlt />
              <h3>
                Pending Leave
                Requests
              </h3>
            </div>

            {pendingLeaveRequests.length === 0 ? (
              <p>
                No pending leave requests.
              </p>
            ) : (
              pendingLeaveRequests.map(request => (
                <div
                  key={request.id}
                  className="request-item leave-request"
                >
                  <h4>
                    {request.user_name || request.user_email || 'Leave Request'}
                  </h4>

                  <p className="request-email">
                    {request.leave_type?.charAt(0).toUpperCase() + request.leave_type?.slice(1)} leave • {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  </p>

                  {request.reason && (
                    <p className="request-message">
                      📝 {request.reason}
                    </p>
                  )}

                  <div className="request-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApproveLeaveRequest(request.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRejectLeaveRequest(request.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Settings