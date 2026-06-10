import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

import {
  createInvitation,
  getInvitations,
  revokeInvitation,
} from '../../services/invitationService'

import {
  getMembers,
  deactivateMember,
  reactivateMember,
} from '../../services/memberService'

import './Invitations.css'

const Invitations = () => {
  const { currentUser } = useAuth()
  const companyId =
    currentUser?.companyId ||
    currentUser?.company_id

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [expiresDays, setExpiresDays] = useState(7)

  const [invitations, setInvitations] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)

  const parseInvitationList = response => {
    if (!response) return []

    if (Array.isArray(response)) return response
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.data?.data)) return response.data.data
    if (Array.isArray(response.invitations)) return response.invitations
    if (Array.isArray(response.data?.invitations)) return response.data.invitations

    return []
  }

  const parseMembersList = response => {
    if (!response) return []

    if (Array.isArray(response)) return response
    if (Array.isArray(response.members)) return response.members
    if (Array.isArray(response.data?.members)) return response.data.members
    if (Array.isArray(response.data)) return response.data

    return []
  }

  const loadInvitations = async () => {
    try {
      setLoading(true)

      if (!companyId) {
        setInvitations([])
        return
      }

      const response = await getInvitations(companyId)
      setInvitations(parseInvitationList(response))
    } catch (error) {
      console.error('Load invitations error:', error)
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      setMembersLoading(true)

      if (!companyId) {
        setMembers([])
        return
      }

      const response = await getMembers(companyId)
      setMembers(parseMembersList(response))
    } catch (error) {
      console.error('Load members error:', error)
      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvitations()
    loadMembers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const handleCreateInvite = async () => {
    if (!email.trim()) {
      alert('Email is required')
      return
    }

    if (!companyId) {
      alert('Company context is required to create an invitation')
      return
    }

    try {
      const response = await createInvitation(
        email,
        role,
        currentUser?.email,
        companyId,
        expiresDays
      )

      const inviteLink =
        response?.data?.invite_link ||
        response?.invite_link ||
        response?.data?.data?.invite_link

      if (inviteLink) {
        await navigator.clipboard.writeText(inviteLink)
        alert('Invite link copied to clipboard')
      } else {
        alert('Invitation created')
      }

      setEmail('')
      setRole('user')
      setExpiresDays(7)
      await loadInvitations()
    } catch (error) {
      console.error('Create invitation error:', error)
      alert('Failed to create invitation')
    }
  }

  const handleRevoke = async inviteId => {
    try {
      await revokeInvitation(inviteId, currentUser?.email, companyId)
      alert('Invitation revoked')
      await loadInvitations()
    } catch (error) {
      console.error('Revoke invitation error:', error)
      alert('Unable to revoke invitation')
    }
  }

  const handleDeactivate = async memberId => {
    try {
      await deactivateMember(
        memberId,
        currentUser?.email,
        companyId
      )
      await loadMembers()
    } catch (error) {
      console.error('Deactivate member error:', error)
      alert('Unable to deactivate member')
    }
  }

  const handleReactivate = async memberId => {
    try {
      await reactivateMember(
        memberId,
        currentUser?.email,
        companyId
      )
      await loadMembers()
    } catch (error) {
      console.error('Reactivate member error:', error)
      alert('Unable to reactivate member')
    }
  }

  const copyInvite = async link => {
    if (!link) {
      alert('No invite link available')
      return
    }

    await navigator.clipboard.writeText(link)
    alert('Invite link copied!')
  }

  return (
    <div className="invitations-page">
      <h1>Users</h1>
      <p className="page-subtitle">
        Manage members and invite links for{' '}
        <strong>{currentUser?.companyName || currentUser?.company || 'Company'}</strong>
      </p>

      <div className="invite-grid">
        <section className="invite-card">
          <h2>Create Invite</h2>

          <div className="invite-form">
            <label>
              Email
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>

            <label>
              Role
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label>
              Expires in days
              <input
                type="number"
                value={expiresDays}
                min={1}
                onChange={e => setExpiresDays(Number(e.target.value) || 1)}
              />
            </label>

            <button onClick={handleCreateInvite} className="primary-btn">
              Create Invite
            </button>
          </div>
        </section>

        <section className="invite-card">
          <h2>Pending Invitations</h2>

          {loading ? (
            <p>Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <p>No pending invitations</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map(invite => (
                    <tr key={invite.id || invite.email}>
                      <td>{invite.email || invite.invitee_email}</td>
                      <td>{invite.role || invite.invite_role || 'User'}</td>
                      <td>{invite.status || 'Pending'}</td>
                      <td className="action-cell">
                        {invite.invite_link ? (
                          <button
                            onClick={() => copyInvite(invite.invite_link)}
                          >
                            Copy Link
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleRevoke(invite.id)}
                          className="danger-btn"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="members-section">
        <h2>Company Members</h2>
        {membersLoading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <p>No members found</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id || member.email}>
                    <td>{member.name || 'Unknown'}</td>
                    <td>{member.email}</td>
                    <td>{member.role || 'User'}</td>
                    <td>
                      {member.is_active === false ? (
                        <span className="status-badge inactive">Inactive</span>
                      ) : (
                        <span className="status-badge active">Active</span>
                      )}
                    </td>
                    <td>
                      {member.is_active === false ? (
                        <button
                          onClick={() => handleReactivate(member.id)}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeactivate(member.id)}
                          className="danger-btn"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Invitations
