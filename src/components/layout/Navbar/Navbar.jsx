import { useState, useEffect } from 'react'

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

  const [showProfileModal, setShowProfileModal] =
    useState(false)

  const [notifications, setNotifications] =
    useState([])

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false)

  /* =========================
     LOAD THEME
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
     LIVE NOTIFICATIONS
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

    updateNotifications()

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

      window.dispatchEvent(
        new Event(
          'notification-update'
        )
      )
    }

  /* =========================
     PROFILE POPUP
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

        {/* LEFT */}

        <div className="navbar-left">

          <button
            className="menu-btn"
            onClick={toggleSidebar}
          >
            <FaBars />
          </button>

           <div className="brand-section">

          <div className="brand-logo">
            EE
          </div>

          <div>
            <h2>EEMS</h2>

            <p>
              Enterprise Employee
              Management
            </p>
          </div>

        </div>

      </div>

       

        {/* RIGHT */}

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

              {notifications.length >
                0 && (
                <span className="notification-badge">
                  {
                    notifications.length
                  }
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}

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
                  notifications
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

                        </div>

                      </div>
                    ))
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

      {/* =========================
          PROFILE MODAL
      ========================= */}

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
                  <FaEnvelope /> Email
                </span>

                <strong>
                  {currentUser?.email}
                </strong>

              </div>

              <div className="popup-info-card">

                <span>
                  <FaUserShield /> Role
                </span>

                <strong className="active-text">
                  {currentUser?.role ||
                    'Employee'}
                </strong>

              </div>

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