import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  /* ================= STATES ================= */

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= LOGIN ================= */

  const handleLogin = async (e) => {
    e.preventDefault()

    if (loading) return

    try {
      setLoading(true)
      setError('')

      console.log("📡 Sending login request...", {
        email,
        password,
      })

      const user = await login(email, password)

      console.log("✅ LOGIN RESPONSE:", user)

      if (!user) {
        setError('Invalid email or password')
        return
      }

      // Save user safety check
      if (!user.companyId) {
        setError('Company not assigned to user')
        return
      }

      /* ================= ROLE ROUTING ================= */

      if (user.is_active === false) {
        navigate('/account-deactivated')
        return
      }

      navigate('/dashboard')

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err)

      setError(
        err?.response?.data?.message ||
        'Server error or backend not running'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Employee Management</h1>

        <p className="login-subtitle">
          Welcome back! Please login to continue.
        </p>

        <form className="login-form" onSubmit={handleLogin}>

          {/* EMAIL */}
          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>

            <div className="password-input-wrapper">

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="error-text">
              {error}
            </p>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* FORGOT PASSWORD */}
          <p
            className="forgot-password-text"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </p>

        </form>

        {/* SIGNUP */}
        <button
          className="signup-button"
          onClick={() => navigate('/signup')}
        >
          SIGN UP
        </button>

        <p className="login-footer">
          Enterprise Employee Management System
        </p>

      </div>
    </div>
  )
}

export default Login