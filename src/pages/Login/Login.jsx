import { useNavigate } from 'react-router-dom'

import './Login.css'

const Login = () => {
  const navigate = useNavigate()

  const handleLogin = event => {
    event.preventDefault()

    navigate('/dashboard')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Employee Management</h1>

        <p className="login-subtitle">
          Welcome back! Please login to continue.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="login-footer">
          Enterprise Employee Management System
        </p>
      </div>
    </div>
  )
}

export default Login