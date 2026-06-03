import { useState } from 'react'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')

  const handleSubmit = e => {
    e.preventDefault()

    if (!email || !password || !role) {
      alert('Fill all fields')
      return
    }

    const users =
      JSON.parse(
        localStorage.getItem('users')
      ) || []

    const userIndex =
      users.findIndex(
        user =>
          user.email === email &&
          user.role === role
      )

    if (userIndex === -1) {
      alert(
        'User not found with selected role'
      )
      return
    }

    // Update password only
    users[userIndex] = {
      ...users[userIndex],
      password,
    }

    localStorage.setItem(
      'users',
      JSON.stringify(users)
    )

    alert(
      'Password updated successfully'
    )

    setEmail('')
    setPassword('')
    setRole('user')
  }

  return (
    <div className="forgot-container">
      <form
        className="forgot-form"
        onSubmit={handleSubmit}
      >
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={e =>
            setEmail(e.target.value)
          }
        />

        <select
          value={role}
          onChange={e =>
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

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e =>
            setPassword(
              e.target.value
            )
          }
        />

        <button type="submit">
          Update Password
        </button>
      </form>
    </div>
  )
}

export default ForgotPassword