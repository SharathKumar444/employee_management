import { useState, useEffect } from 'react'

import {
  FaBell,
  FaMoon,
  FaSun,
  FaChevronDown,
  FaSearch,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from 'react-icons/fa'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../context/AuthContext'

import './Navbar.css'

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

  const [notifications, setNotifications] =
    useState([])

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false)

  /* =========================
     THEME
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
     LIVE NOTIFICATION UPDATE
  ========================= */

  useEffect(() => {
    const updateNotifications = () => {
      const savedNotifications =
        JSON.parse(
          localStorage.getItem(
            'notifications'
          )
        ) || []

      setNotifications(
        savedNotifications
      )
    }

    // INITIAL LOAD
    updateNotifications()

    // LISTENER
    window.addEventListener(
      'notification-update',
      updateNotifications
    )

    return () => {
      window.removeEventListener(
        'notification-update',
        updateNotifications
      )
    }
  }, [])

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
      localStorage.removeItem(
        'notifications'
      )

      setNotifications([])
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
    <header className="navbar">

      {/* LEFT */}

      <div className="navbar-left">

        <button
          className="menu-btn"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search here..."
          />

        </div>

      </div>

      {/* RIGHT */}

      <div className="navbar-right">

        {/* THEME */}

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

            {notifications.length >
              0 && (
              <span className="notification-badge">
                {
                  notifications.length
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

                {notifications.length >
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

              {notifications.length ===
              0 ? (
                <div className="empty-notification">
                  No notifications
                </div>
              ) : (
                notifications.map(
                  notification => (
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

                      </div>

                    </div>
                  )
                )
              )}

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

          {showDropdown && (
            <div className="profile-dropdown">

              <button>
                <FaUser />
                Profile
              </button>

              <button
                onClick={() =>
                  navigate('/settings')
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
  )
}

export default Navbar