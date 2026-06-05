import { useState } from 'react'

import './InviteUserModal.css'

const InviteUserModal = ({
  onClose,
  onInvite,
}) => {
  const [email, setEmail] =
    useState('')

  const [role, setRole] =
    useState('User')

  const handleSubmit = () => {
    if (!email.trim()) {
      alert('Email required')
      return
    }

    onInvite({
      email,
      role,
    })
  }

  return (
    <div className="modal-overlay">

      <div className="invite-modal">

        <h2>Invite User</h2>

        <div className="form-group">

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={e =>
              setEmail(
                e.target.value
              )
            }
            placeholder="Enter Email"
          />

        </div>

        <div className="form-group">

          <label>Role</label>

          <select
            value={role}
            onChange={e =>
              setRole(
                e.target.value
              )
            }
          >
            <option value="User">
              User
            </option>

            <option value="Admin">
              Admin
            </option>

          </select>

        </div>

        <div className="modal-actions">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="invite-btn"
            onClick={handleSubmit}
          >
            Generate Invite
          </button>

        </div>

      </div>

    </div>
  )
}

export default InviteUserModal