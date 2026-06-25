import { useState, useEffect, useCallback } from 'react'

import {
  FaBell,
  FaMoon,
  FaSun,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaEnvelope,
  FaUserShield,
} from 'react-icons/fa'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../context/AuthContext'

import { getMembers } from '../../../services/memberService'

import './Navbar.css'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../../services/notificationService'
import {
  approveAttendanceRequest,
  rejectAttendanceRequest,
  approveAttendanceRequestBackend,
  rejectAttendanceRequestBackend,
} from '../../../services/attendanceService'
import {
  getProfileCompletionScore,
  getMissingProfileFields,
} from '../../../utils/profileCompletion'
import {
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../../../services/leaveService'

const Navbar = ({ toggleSidebar }) => {

  const { currentUser, logout } =
    useAuth()

  const navigate = useNavigate()

  /* =========================
     STATES
  ========================= */

  const [darkMode, setDarkMode] =
    useState(false)

  const [showDropdown, setShowDropdown] =
    useState(false)

  const [showProfileModal, setShowProfileModal] =
    useState(false)

  const [notifications, setNotifications] =
    useState([])

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false)

  const visibleNotifications = notifications.filter(notification => !notification.is_read)

  const completionScore = getProfileCompletionScore(currentUser)
  const missingProfileFields = getMissingProfileFields(currentUser)

  const getCompanyId = user =>
    user?.companyId ||
    user?.company_id ||
    user?.company?.companyId ||
    user?.company?.company_id ||
    null

  const resolveLeaveRequestId = notification => {
    if (!notification) return null
    if (notification.requestId) return notification.requestId
    if (notification.parsed?.request_id) return notification.parsed?.request_id
    if (notification.parsed?.id) return notification.parsed?.id

    const rawPayload = notification.payload || notification.message || ''
    if (typeof rawPayload !== 'string' || !rawPayload) {
      return null
    }

    try {
      const parsed = JSON.parse(rawPayload)
      if (parsed?.request_id) return parsed.request_id
      if (parsed?.id) return parsed.id
    } catch {
      // Not JSON payload
    }

    const requestMatch = rawPayload.match(/#(\d+)/) ||
      rawPayload.match(/"request_id"\s*:\s*"?(\d+)"?/) ||
      rawPayload.match(/request_id\s*:\s*"?(\d+)"?/) ||
      rawPayload.match(/"id"\s*:\s*"?(\d+)"?/) ||
      rawPayload.match(/id\s*:\s*"?(\d+)"?/) ||
      rawPayload.match(/leave request\s*#(\d+)/i)

    return requestMatch?.[1] || null
  }

  const resolveAttendanceRequestUserId = async (
    notification,
    companyId
  ) => {
    if (!notification || !companyId) return null

    if (notification.requestUserId || notification.requestUserId === 0) {
      return notification.requestUserId
    }

    if (notification.userId || notification.user_id) {
      return notification.userId || notification.user_id
    }

    const rawPayload = notification.payload || notification.message || ''
    if (typeof rawPayload === 'string' && rawPayload) {
      try {
        const parsed = JSON.parse(rawPayload)
        if (parsed?.user_id) return parsed.user_id
        if (parsed?.userId) return parsed.userId
        if (parsed?.user_email) {
          const membersRes = await getMembers(companyId)
          if (membersRes?.success && Array.isArray(membersRes.members)) {
            const member = membersRes.members.find(
              m => m.email === parsed.user_email
            )
            return member?.id || null
          }
        }
      } catch {
        const emailMatch = rawPayload.match(/\(([^)]+)\)/)
        if (emailMatch) {
          const userEmail = emailMatch[1]
          const membersRes = await getMembers(companyId)
          if (membersRes?.success && Array.isArray(membersRes.members)) {
            const member = membersRes.members.find(
              m => m.email === userEmail
            )
            return member?.id || null
          }
        }
      }
    }

    if (notification.userEmail || notification.user_email) {
      const userEmail = notification.userEmail || notification.user_email
      const membersRes = await getMembers(companyId)
      if (membersRes?.success && Array.isArray(membersRes.members)) {
        const member = membersRes.members.find(
          m => m.email === userEmail
        )
        return member?.id || null
      }
    }

    return null
  }

  /* =========================
     LOAD THEME
  =========================
  ========================= */

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
  }, [])

  /* =========================
     LOAD NOTIFICATIONS
  ========================= */

  const loadNotifications = useCallback(async () => {
    const userId =
      currentUser?.id ||
      currentUser?._id ||
      currentUser?.user_id ||
      null
    const userEmail =
      currentUser?.email ||
      currentUser?.user_email ||
      null

    if (!userId && !userEmail) return

    try {
      const res = await getNotifications(
        userId,
        userEmail
      )
      if (res?.success) {
        const mapped = res.data.map(n => ({
          ...n,
          time: new Date(n.created_at).toLocaleString(),
        }))
        setNotifications(mapped)
      }
    } catch {
      const userId =
        currentUser?.id ||
        currentUser?._id ||
        currentUser?.user_id ||
        null
      const userEmail =
        currentUser?.email ||
        currentUser?.user_email ||
        null

      const normalizedUserId =
        userId !== undefined && userId !== null
          ? String(userId)
          : null
      const normalizedUserEmail =
        userEmail || null

      const saved = JSON.parse(localStorage.getItem('notifications')) || []
      const userNotifications = saved.filter(note => {
        const recipientId =
          note.recipient_user_id !== undefined &&
          note.recipient_user_id !== null
            ? String(note.recipient_user_id)
            : null
        const recipientEmail = note.recipient_email || null

        return (
          (normalizedUserId && recipientId === normalizedUserId) ||
          (normalizedUserEmail && recipientEmail === normalizedUserEmail)
        )
      })
      setNotifications(userNotifications)
    }
  }, [currentUser])

  useEffect(() => {
    const fetchNotifications = async () => {
      await loadNotifications()
    }

    fetchNotifications()

    const handleNotificationUpdate = () => {
      fetchNotifications()
    }

    window.addEventListener(
      'notification-update',
      handleNotificationUpdate
    )

    window.addEventListener('storage', handleNotificationUpdate)

    return () => {
      window.removeEventListener(
        'notification-update',
        handleNotificationUpdate
      )
      window.removeEventListener(
        'storage',
        handleNotificationUpdate
      )
    }
  }, [loadNotifications])

  const handleAttendanceNotificationAction = async (
    notification,
    action
  ) => {
    if (!currentUser) return

    try {
      const companyId = getCompanyId(currentUser)
      const leaveRequestId = notification.type === 'leave_request' ? resolveLeaveRequestId(notification) : null

      if (notification.type === 'leave_request') {
        if (!leaveRequestId) {
          console.error('Cannot approve/reject leave request: request id missing', notification)
          return
        }

        let res = null
        if (action === 'approve') {
          res = await approveLeaveRequest(leaveRequestId, currentUser.email, companyId)
          if (!res?.success) console.error('Leave approve failed', res)
        } else {
          res = await rejectLeaveRequest(leaveRequestId, currentUser.email, companyId)
          if (!res?.success) console.error('Leave reject failed', res)
        }

        if (res?.success && notification.id) {
          await markNotificationRead(notification.id)
        }
      } else if (notification.type === 'attendance-request') {
        const requestId = notification.requestId
        let res = null

        if (requestId) {
          if (action === 'approve') {
            res = await approveAttendanceRequest(requestId, currentUser)
          } else {
            res = await rejectAttendanceRequest(requestId, currentUser)
          }
        }

        if (!res) {
          const resolvedUserId = await resolveAttendanceRequestUserId(
            notification,
            companyId
          )

          if (!resolvedUserId) {
            console.error('Cannot resolve attendance request user id for notification', notification)
            return
          }

          if (action === 'approve') {
            res = await approveAttendanceRequestBackend(resolvedUserId, currentUser.email, companyId)
          } else {
            res = await rejectAttendanceRequestBackend(resolvedUserId, currentUser.email, companyId)
          }
        }

        if (!res?.success) {
          console.error('Attendance request action failed', res)
        }
      } else {
        // Server-side notification (payload), resolve target user from structured or legacy payload
        const rawPayload = notification.payload || notification.message || ''
        let parsedPayload = null
        let targetEmail = null
        let targetUserIdFromPayload = null

        try {
          parsedPayload = rawPayload ? JSON.parse(rawPayload) : null
        } catch {
          parsedPayload = null
        }

        if (parsedPayload) {
          targetEmail = parsedPayload.user_email || parsedPayload.userEmail || null
          targetUserIdFromPayload = parsedPayload.user_id || parsedPayload.userId || null
        }

        if (!targetEmail) {
          const emailMatch = rawPayload.match(/\(([^)]+)\)/)
          targetEmail = emailMatch ? emailMatch[1] : null
        }

        if (!targetEmail) {
          console.error('Cannot parse target email from notification payload', rawPayload)
          return
        }

        const targetUserId = notification.requestUserId || notification.requestUserId === 0 ? notification.requestUserId : targetUserIdFromPayload
        const targetUserEmail = notification.requestUserEmail || notification.requestUserEmail === '' ? notification.requestUserEmail : targetEmail

        let resolvedUserId = targetUserId

        if (!resolvedUserId) {
          try {
            const membersRes = await getMembers(companyId)
            if (membersRes?.success && Array.isArray(membersRes.members)) {
              const targetMember = membersRes.members.find(m => m.email === targetUserEmail)
              resolvedUserId = targetMember?.id
            }
          } catch (err) {
            console.error('Failed to resolve member by email', err)
          }
        }

        if (!resolvedUserId) {
          console.error('Target user id not found for notification', notification)
          return
        }

        if (action === 'approve') {
          const res = await approveAttendanceRequestBackend(resolvedUserId, currentUser.email, companyId)
          if (!res?.success) console.error('Backend approve failed', res)
        } else {
          const res = await rejectAttendanceRequestBackend(resolvedUserId, currentUser.email, companyId)
          if (!res?.success) console.error('Backend reject failed', res)
        }
      }

      // Reload notifications and dispatch events
      await loadNotifications()
      window.dispatchEvent(new Event('attendance-access-updated'))
      window.dispatchEvent(new Event('notification-update'))
    } catch (err) {
      console.error('Failed to update attendance request', err)
    }
  }

  /* =========================
     TOGGLE THEME
  ========================= */

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

  /* =========================
     CLEAR NOTIFICATIONS
  ========================= */

  const clearNotifications =
    () => {

      if (currentUser?.id || currentUser?.email) {
        markAllNotificationsRead(
          currentUser.id,
          currentUser.email
        ).catch(() => {})
      }

      localStorage.removeItem('notifications')
      setNotifications([])
    }

  /* =========================
     PROFILE
  ========================= */

  const handleProfileClick =
    () => {

      setShowDropdown(false)

      setShowProfileModal(true)
    }

  /* =========================
     SETTINGS
  ========================= */

  const handleSettingsClick =
    () => {

      setShowDropdown(false)

      navigate('/settings')
    }

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {

    logout()

    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <>

      <header className="navbar">

        {/* LEFT SECTION */}

        <div className="navbar-left">

          {/* SIDEBAR TOGGLE BUTTON */}

          <button
            className="menu-btn"
            onClick={toggleSidebar}
          >
            <FaBars />
          </button>

          {/* BRAND */}

          <div className="brand-section">

            <div className="brand-logo">
              EE
            </div>

            <div className="brand-text">

              <h2>EEMS</h2>

              <p>
                Enterprise Employee
                Management
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT SECTION */}

        <div className="navbar-right">

          {/* DARK MODE */}

          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
          >
            {darkMode ? (
              <FaSun />
            ) : (
              <FaMoon />
            )}
          </button>

          {/* NOTIFICATIONS */}

          <div className="notification-wrapper">

            <button
              className="nav-icon-btn notification-btn"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >

              <FaBell />

              {visibleNotifications.length >
                0 && (
                <span className="notification-badge">
                  {
                    visibleNotifications.length
                  }
                </span>
              )}

            </button>

            {/* DROPDOWN */}

            {showNotifications && (

              <div className="notification-dropdown">

                <div className="notification-header">

                  <h4>
                    Notifications
                  </h4>

                  {visibleNotifications.length >
                    0 && (
                    <button
                      className="clear-btn"
                      onClick={
                        clearNotifications
                      }
                    >
                      Clear all
                    </button>
                  )}

                </div>

                {visibleNotifications.length ===
                0 ? (

                  <div className="empty-notification">
                    No notifications
                  </div>

                ) : (

                  <div className="notification-body">
                    {visibleNotifications
                      .slice()
                      .reverse()
                      .map(notification => (

                        <div
                          key={
                            notification.id
                          }
                          className="notification-item"
                        >

                        <div className="notification-dot" />

                        <div>

                          <p>
                            {
                              notification.message
                            }
                          </p>

                          <span>
                            {
                              notification.time
                            }
                          </span>

                          {(currentUser?.role === 'admin') && (
                            ((notification.type === 'attendance-request' && notification.status === 'pending') || notification.type === 'attendance_access_request' || (notification.type === 'leave_request' && notification.status === 'pending')) && (
                              <div className="notification-actions">
                                <button
                                  className="approve-btn"
                                  onClick={() =>
                                    handleAttendanceNotificationAction(
                                      notification,
                                      'approve'
                                    )
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={() =>
                                    handleAttendanceNotificationAction(
                                      notification,
                                      'reject'
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            )
                          )}

                        </div>

                      </div>
                      ))}
                    </div>

                  )}

                  <div className="notification-footer">
                    <button onClick={() => { setShowNotifications(false); window.dispatchEvent(new Event('storage')); navigate('/notifications') }}>
                      View all
                    </button>
                  </div>

              </div>
            )}

          </div>

          {/* PROFILE */}

          <div className="profile-wrapper">

            <div
              className="profile-section"
              onClick={() =>
                setShowDropdown(
                  !showDropdown
                )
              }
            >

              <div className="profile-avatar">

                {currentUser?.email
                  ?.charAt(0)
                  ?.toUpperCase() || 'U'}

              </div>

              <span className="profile-name">

                {currentUser?.email?.split(
                  '@'
                )[0] || 'User'}

              </span>

              <FaChevronDown className="dropdown-icon" />

            </div>

            {/* PROFILE DROPDOWN */}

            {showDropdown && (

              <div className="profile-dropdown">

                <button
                  onClick={
                    handleProfileClick
                  }
                >
                  <FaUser />
                  My Profile
                </button>

                <button
                  onClick={
                    handleSettingsClick
                  }
                >
                  <FaCog />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="logout-dropdown"
                >
                  <FaSignOutAlt />
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* PROFILE MODAL */}

      {showProfileModal && (

        <div className="profile-popup-overlay">

          <div className="profile-popup">

            {/* TOP */}

            <div className="profile-popup-top">

              <button
                className="close-popup"
                onClick={() =>
                  setShowProfileModal(
                    false
                  )
                }
              >
                <FaTimes />
              </button>

              <div className="popup-avatar">

                {currentUser?.email
                  ?.charAt(0)
                  ?.toUpperCase() || 'U'}

              </div>

              <h2>

                {currentUser?.email?.split(
                  '@'
                )[0] || 'User'}

              </h2>

              <p>
                Employee Management System
              </p>

            </div>

            {/* BODY */}

            <div className="popup-body">

              <div className="popup-info-card">

                <span>
                  <FaEnvelope />
                  Email
                </span>

                <strong>
                  {currentUser?.email}
                </strong>

              </div>

              <div className="popup-info-card">

                <span>
                  <FaUserShield />
                  Role
                </span>

                <strong className="active-text">

                  {currentUser?.role ||
                    'Employee'}

                </strong>

              </div>

              <div className="popup-info-card profile-completion-card">
                <span>Profile Completion</span>
                <div className="completion-row">
                  <strong>{completionScore}%</strong>
                  <small>
                    {completionScore === 100
                      ? 'Profile complete'
                      : `${missingProfileFields.length} fields missing`}
                  </small>
                </div>
                <div className="completion-bar">
                  <div
                    className="completion-fill"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
              </div>

              {missingProfileFields.length > 0 && (
                <div className="popup-info-card missing-fields-card">
                  <span>Missing Profile Fields</span>
                  <div className="missing-field-list">
                    {missingProfileFields
                      .slice(0, 5)
                      .map(field => (
                        <span
                          key={field}
                          className="missing-field-pill"
                        >
                          {field}
                        </span>
                      ))}
                    {missingProfileFields.length > 5 && (
                      <small>
                        +{missingProfileFields.length - 5} more
                      </small>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER */}

            <div className="popup-footer">

              <button
                className="profile-settings-btn"
                onClick={() => {

                  setShowProfileModal(
                    false
                  )

                  navigate('/settings')
                }}
              >
                Settings
              </button>

              <button
                className="profile-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  )
}

export default Navbar