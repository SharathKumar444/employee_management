import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa'

import { validateInvite, signupWithInvite } from '../../services/invitationService'
import './Signup.css'

const Signup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [role, setRole] =
    useState('user')

  const [companyId, setCompanyId] =
    useState('COMP001')

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [inviteLoading, setInviteLoading] =
    useState(false)

  useEffect(() => {
    if (inviteToken) {
      loadInvitation(inviteToken)
    }
  }, [inviteToken])

  const loadInvitation = async (token) => {
    try {
      setInviteLoading(true)
      const response = await validateInvite(token)

      if (response?.success && response?.data) {
        const invitation = response.data
        setEmail(invitation.email || '')
        setRole(invitation.role || 'user')
        setCompanyId(invitation.company_id || 'COMP001')
      } else {
        setError(response?.message || 'Invalid or expired invitation link')
      }
    } catch (err) {
      console.error('Load invitation error:', err)
      setError('Could not load invitation details')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleSignup = async e => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

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

      const response = await signupWithInvite(
        name.trim(),
        email.trim(),
        password.trim(),
        role,
        companyId,
        inviteToken
      )

      if (response?.success) {
        alert('Account created successfully')
        navigate('/login')
      } else {
        setError(
          response?.message ||
          'Signup failed. Try again.'
        )
      }
    } catch (err) {
      console.error('Signup error:', err)

      setError(
        err.response?.data?.message ||
        err.message ||
        'Signup failed. Server error.'
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
          Register a new employee account
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

          {/* COMPANY */}

          <div className="input-group">
            <label>
              Company
            </label>

            <select
              value={companyId}
              onChange={e =>
                setCompanyId(
                  e.target.value
                )
              }
            >
              <option value="COMP001">
                Company A
              </option>

              <option value="COMP002">
                Company B
              </option>

              <option value="COMP003">
                Company C
              </option>
            </select>
          </div>

          {/* ERROR */}

          {error && (
            <p className="error-text">
              {error}
            </p>
          )}

          {/* LOADING INVITE */}

          {inviteLoading && (
            <p className="info-text">
              Loading invitation details...
            </p>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="signup-button"
            disabled={loading || inviteLoading}
          >
            {loading
              ? 'Creating account...'
              : inviteLoading
                ? 'Loading...'
                : 'Sign Up'}
          </button>

        </form>

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