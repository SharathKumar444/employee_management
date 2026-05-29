import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa'

import './Signup.css'

const Signup = () => {
  const navigate = useNavigate()

  /* =========================
     STATES
  ========================= */

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [role, setRole] =
    useState('user')

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  /* =========================
     SIGNUP
  ========================= */

  const handleSignup = async e => {
    e.preventDefault()

    try {
      setLoading(true)

      setError('')

      // VALIDATION

      if (
        !name.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        setError(
          'Please fill all fields'
        )
        return
      }

      // GET EXISTING USERS

      const existingUsers =
        JSON.parse(
          localStorage.getItem(
            'users'
          )
        ) || []

      // CHECK EMAIL EXISTS

      const emailExists =
        existingUsers.find(
          user =>
            user.email === email
        )

      if (emailExists) {
        setError(
          'Email already exists'
        )
        return
      }

      // CREATE USER

      const userData = {
        id: Date.now(),
        name,
        email,
        password,
        role,
      }

      // SAVE USERS

      const updatedUsers = [
        ...existingUsers,
        userData,
      ]

      localStorage.setItem(
        'users',
        JSON.stringify(updatedUsers)
      )

      alert(
        'Account created successfully'
      )

      navigate('/login')

    } catch (err) {
      console.error(err)

      setError(
        'Signup failed. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">

      <div className="signup-card">

        <h1>Create Account</h1>

        <p className="signup-subtitle">
          Register a new employee
          account
        </p>

        <form
          onSubmit={handleSignup}
          className="signup-form"
        >

          {/* NAME */}

          <div className="input-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={e =>
                setName(
                  e.target.value
                )
              }
              placeholder="Enter full name"
              required
            />

          </div>

          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={e =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter email"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>
              Password
            </label>

            <div className="password-wrapper">

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
                placeholder="Enter password"
                required
              />

              <span
                className="password-eye"
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
              </span>

            </div>

          </div>

          {/* ROLE */}

          <div className="input-group">

            <label>
              Role
            </label>

            <select
              value={role}
              onChange={e =>
                setRole(
                  e.target.value
                )
              }
            >

              <option value="user">
                User
              </option>

              <option value="admin">
                Admin
              </option>

            </select>

          </div>

          {/* ERROR */}

          {error && (
            <p className="error-text">
              {error}
            </p>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >

            {loading
              ? 'Creating account...'
              : 'Sign Up'}

          </button>

        </form>

        {/* LOGIN */}

        <p className="signup-footer">

          Already have an account?

          <span
            onClick={() =>
              navigate('/login')
            }
            className="login-link"
          >
            Login here
          </span>

        </p>

      </div>

    </div>
  )
}

export default Signup