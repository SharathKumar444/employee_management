import { useState } from 'react'

import Members from '../Members/Members'
import ReactivationRequests from '../ReactivationRequests/ReactivationRequests'

import './Invitations.css'

const Invitations = () => {
  const [activeTab, setActiveTab] =
    useState('invitations')

  const [email, setEmail] =
    useState('')

  const [role, setRole] =
    useState('User')

  const [
    expiresDays,
    setExpiresDays,
  ] = useState(7)

  const [invites, setInvites] =
    useState([])

  // =========================
  // CREATE INVITE
  // =========================

  const handleCreateInvite =
    async () => {
      if (!email.trim()) {
        alert(
          'Please enter email'
        )
        return
      }

      const inviteLink =
        `${window.location.origin}/signup` +
        `?email=${encodeURIComponent(
          email
        )}` +
        `&role=${role}`

      const newInvite = {
        id: Date.now(),
        email,
        role,
        status: 'Pending',
        expires: new Date(
          Date.now() +
            expiresDays *
              24 *
              60 *
              60 *
              1000
        )
          .toISOString()
          .split('T')[0],
        link: inviteLink,
      }

      try {
        await navigator.clipboard.writeText(
          inviteLink
        )

        setInvites(prev => [
          ...prev,
          newInvite,
        ])

        alert(
          'Invitation link copied successfully!'
        )

        setEmail('')
        setRole('User')
        setExpiresDays(7)
      } catch (error) {
        console.error(error)

        alert(
          'Failed to copy invitation link'
        )
      }
    }

  // =========================
  // COPY LINK
  // =========================

  const handleCopyLink =
    async link => {
      try {
        await navigator.clipboard.writeText(
          link
        )

        alert(
          'Link copied successfully!'
        )
      } catch (error) {
        console.error(error)

        alert(
          'Failed to copy link'
        )
      }
    }

  // =========================
  // REVOKE
  // =========================

  const handleRevokeInvite =
    id => {
      setInvites(prev =>
        prev.filter(
          invite =>
            invite.id !== id
        )
      )

      alert(
        'Invitation revoked'
      )
    }

  return (
    <div className="user-management-page">
      {/* HEADER */}

      <div className="page-header">
        <h1>User Management</h1>

        <p>
          Manage invitations,
          members and reactivation
          requests.
        </p>
      </div>

      {/* TABS */}

      <div className="tabs-container">
        <button
          className={
            activeTab ===
            'invitations'
              ? 'tab-btn active'
              : 'tab-btn'
          }
          onClick={() =>
            setActiveTab(
              'invitations'
            )
          }
        >
          Invitations
        </button>

        <button
          className={
            activeTab ===
            'members'
              ? 'tab-btn active'
              : 'tab-btn'
          }
          onClick={() =>
            setActiveTab('members')
          }
        >
          Members
        </button>

        <button
          className={
            activeTab ===
            'reactivation'
              ? 'tab-btn active'
              : 'tab-btn'
          }
          onClick={() =>
            setActiveTab(
              'reactivation'
            )
          }
        >
          Reactivation Requests
        </button>
      </div>

      {/* INVITATIONS */}

      {activeTab ===
        'invitations' && (
        <>
          <div className="invite-card">
            <h2>
              Create Invitation
            </h2>

            <div className="invite-form">
              <input
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={e =>
                  setEmail(
                    e.target.value
                  )
                }
              />

              <select
                value={role}
                onChange={e =>
                  setRole(
                    e.target.value
                  )
                }
              >
                <option>
                  User
                </option>
                <option>
                  Admin
                </option>
              </select>

              <input
                type="number"
                min="1"
                value={
                  expiresDays
                }
                onChange={e =>
                  setExpiresDays(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              <button
                onClick={
                  handleCreateInvite
                }
              >
                Create & Copy Link
              </button>
            </div>
          </div>

          {/* TABLE */}

          <div className="pending-card">
            <h2>
              Pending Invitations
            </h2>

            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {invites.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign:
                          'center',
                      }}
                    >
                      No invitations
                      created
                    </td>
                  </tr>
                ) : (
                  invites.map(
                    invite => (
                      <tr
                        key={
                          invite.id
                        }
                      >
                        <td>
                          {
                            invite.email
                          }
                        </td>

                        <td>
                          {
                            invite.role
                          }
                        </td>

                        <td>
                          {
                            invite.status
                          }
                        </td>

                        <td>
                          {
                            invite.expires
                          }
                        </td>

                        <td>
                          <button
                            onClick={() =>
                              handleCopyLink(
                                invite.link
                              )
                            }
                          >
                            Copy Link
                          </button>

                          <button
                            onClick={() =>
                              handleRevokeInvite(
                                invite.id
                              )
                            }
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MEMBERS */}

      {activeTab ===
        'members' && (
        <Members />
      )}

      {/* REACTIVATION */}

      {activeTab ===
        'reactivation' && (
        <ReactivationRequests />
      )}
    </div>
  )
}

export default Invitations