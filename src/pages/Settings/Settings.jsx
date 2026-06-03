import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

import './Settings.css'

import {
  FaBell,
  FaUser,
  FaDesktop,
  FaMoon,
  FaSun,
  FaUserShield,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const approveRequest = request => {
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

  const rejectRequest = request => {
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
                          approveRequest(
                            request
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectRequest(
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
        )}

      </div>
    </div>
  )
}

export default Settings