import { useState } from 'react'

import './ForgotPassword.css'

const ForgotPassword = () => {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const handleSubmit = e => {
    e.preventDefault()

    if (!email || !password) {
      alert('Fill all fields')
      return
    }

    alert(
      'Password updated successfully'
    )
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