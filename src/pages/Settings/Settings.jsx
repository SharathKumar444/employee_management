import { useEffect, useState } from 'react'

import './Settings.css'

import {
  FaBell,
  FaUser,
  FaDesktop,
  FaMoon,
  FaSun,
} from 'react-icons/fa'

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false)

  // LOAD SAVED THEME
  useEffect(() => {
    const savedTheme =
      localStorage.getItem('theme')

    if (savedTheme === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDarkMode(true)
      document.body.classList.add('dark-theme')
    }
  }, [])

  // TOGGLE THEME
  const toggleTheme = () => {
    const newTheme = !darkMode

    setDarkMode(newTheme)

    if (newTheme) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="settings-page">

      {/* HEADER */}
      <div className="settings-header">
        <h1>Settings</h1>

        <p>
          Manage appearance, notifications,
          and your account preferences.
        </p>
      </div>

      {/* GRID */}
      <div className="settings-grid">

        {/* APPEARANCE */}
        <div className="settings-card">

          <div className="card-title">
            <FaDesktop className="icon blue" />
            <h3>Appearance</h3>
          </div>

          <p>
            Switch between light and dark themes.
          </p>

          <div className="row">

            <span>
              Current theme:
              {' '}
              {darkMode ? 'Dark' : 'Light'}
            </span>

            <button
              className="icon-btn"
              onClick={toggleTheme}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

          </div>

        </div>

        {/* NOTIFICATIONS */}
        <div className="settings-card">

          <div className="card-title">
            <FaBell className="icon yellow" />
            <h3>Notifications</h3>
          </div>

          <p>
            Control alerts for employee activity.
          </p>

          <label className="checkbox-row">
            <input
              type="checkbox"
              defaultChecked
            />

            Notify when employees are added
            or updated
          </label>

        </div>

        {/* ACCOUNT */}
        <div className="settings-card">

          <div className="card-title">
            <FaUser className="icon green" />
            <h3>Account</h3>
          </div>

          <div className="account-box">

            <div className="avatar">
              K
            </div>

            <div>
              <p className="name">
                SHARATH
              </p>

              <p className="email">
                sharath@gmail.com
              </p>

              <span className="role">
                User
              </span>
            </div>

          </div>

        </div>

        {/* SYSTEM */}
        <div className="settings-card">

          <div className="card-title">
            <FaDesktop className="icon purple" />
            <h3>System</h3>
          </div>

          <div className="system-info">
            <p>
              <b>Application:</b> EMS v1.0
            </p>

            <p>
              <b>API:</b> FastAPI + SQLite
            </p>

            <p>
              <b>Frontend:</b> React + Vite
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Settings