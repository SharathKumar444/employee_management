import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const user = await login(email, password)

      if (!user) {
        setError('Login failed')
        return
      }

      navigate('/dashboard')

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Invalid email or password')
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

          {/* Email */}
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="error-text">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* SIGNUP BUTTON (NEW) */}
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