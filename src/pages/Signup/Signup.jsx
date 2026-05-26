import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Signup.css'
 
const Signup = () => {
 
  const navigate = useNavigate()
 
  const [name, setName] = useState("")
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
 
  const handleSignup = async (e) => {
 
    e.preventDefault()
 
    try {
 
      setLoading(true)
      setError('')
 
      const userData = {
        name,
        email,
        password,
        role,
      }
 
      // Save user to localStorage
      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      )
 
      console.log('User registered:', userData)
 
      // Redirect to login
      navigate('/login')
 
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
 
      setError('Signup failed. Try again.')
 
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
 
          {/* Name */}
<div className="input-group">
 
            <label>Full Name</label>
 
            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter full name"
              required
            />
 
          </div>
 
          {/* Email */}
<div className="input-group">
 
            <label>Email</label>
 
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
              required
            />
 
          </div>
 
          {/* Password */}
<div className="input-group">
 
            <label>Password</label>
 
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
            />
 
          </div>
 
          {/* Role */}
<div className="input-group">
 
            <label>Role</label>
 
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
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
 
          {/* Error */}
          {error && (
<p className="error-text">
              {error}
</p>
          )}
 
          {/* Button */}
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