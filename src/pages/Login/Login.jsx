import { useState } from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa'

import {
  useAuth,
} from '../../context/AuthContext'

import './Login.css'

const Login = () => {
  const navigate = useNavigate()

  const { login } = useAuth()

  /* =========================
     STATES
  ========================= */

  const [email, setEmail] =
    useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [error, setError] =
    useState('')

  const [
    loading,
    setLoading,
  ] = useState(false)

  /* =========================
     LOGIN
  ========================= */

  const handleLogin = async (
    event
  ) => {
    event.preventDefault()

    try {
      setLoading(true)

      setError('')

      const user =
        await login(
          email,
          password
        )

      if (!user) {
        setError(
          'Invalid email or password'
        )

        return
      }

      /* ROLE BASED REDIRECT */

      if (
        user.role === 'admin'
      ) {
        navigate('/dashboard')
      } else {
        navigate('/dashboard')
      }

      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError(
        'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">

      <div className="login-card">

        {/* TITLE */}

        <h1>
          Employee Management
        </h1>

        <p className="login-subtitle">
          Welcome back!
          Please login to continue.
        </p>

        {/* FORM */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={e =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>
              Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={e =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
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

            {loading
              ? 'Logging in...'
              : 'Login'}

          </button>

          {/* FORGOT PASSWORD */}

          <p
            className="forgot-password-text"
            onClick={() =>
              navigate(
                '/forgot-password'
              )
            }
          >
            Forgot Password?
          </p>

        </form>

        {/* SIGNUP BUTTON */}

        <button
          className="signup-button"
          onClick={() =>
            navigate('/signup')
          }
        >
          SIGN UP
        </button>

        {/* FOOTER */}

        <p className="login-footer">
          Enterprise Employee
          Management System
        </p>

      </div>

    </div>
  )
}

export default Login