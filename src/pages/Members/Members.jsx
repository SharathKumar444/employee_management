import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import {
  getMembers,
  deactivateMember,
  reactivateMember,
} from '../../services/memberService'

import ConfirmModal from '../../components/employee/ConfirmModal/ConfirmModal'
import './Members.css'

const Members = () => {
  const { currentUser } = useAuth()
  const companyId =
    currentUser?.companyId ||
    currentUser?.company_id

  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [pendingMember, setPendingMember] = useState(null)
  const [deactivationReason, setDeactivationReason] = useState('')

  const loadMembers = async () => {
    if (!companyId) {
      setMembers([])
      return
    }

    try {
      setLoading(true)
      const response = await getMembers(companyId)
      const membersData =
        Array.isArray(response)
          ? response
          : response?.members ||
            response?.data?.members ||
            response?.data ||
            []

      setMembers(membersData)
    } catch (error) {
      console.error('Load members error:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!companyId) {
      return
    }

    const load = async () => {
      await loadMembers()
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const handleSuspend = member => {
    setPendingMember(member)
    setDeactivationReason('')
    setShowSuspendModal(true)
  }

  const handleDeactivate = async member => {
    const memberId =
      member.id ||
      member.member_id ||
      member.user_id

    try {
      await deactivateMember(
        memberId,
        currentUser?.email,
        companyId
      )
      toast.success(
        `${member.name} has been deactivated.`
      )
      await loadMembers()
    } catch (error) {
      console.error('Deactivate member error:', error)
      toast.error(
        error?.response?.data?.detail ||
        'Unable to deactivate member'
      )
    }
  }

  const confirmSuspend = async () => {
    if (!pendingMember) {
      return
    }

    const memberId =
      pendingMember.id ||
      pendingMember.member_id ||
      pendingMember.user_id

    try {
      await deactivateMember(
        memberId,
        currentUser?.email,
        companyId,
        deactivationReason
      )
      toast.success(
        `${pendingMember.name} has been suspended.`
      )
      await loadMembers()
    } catch (error) {
      console.error('Suspend member error:', error)
      toast.error(
        error?.response?.data?.detail ||
        'Unable to suspend member'
      )
    } finally {
      setShowSuspendModal(false)
      setPendingMember(null)
      setDeactivationReason('')
    }
  }

  const handleReactivate = member => {
    setPendingMember(member)
    setShowReactivateModal(true)
  }

  const confirmReactivate = async () => {
    if (!pendingMember) {
      return
    }

    const memberId =
      pendingMember.id ||
      pendingMember.member_id ||
      pendingMember.user_id

    try {
      await reactivateMember(
        memberId,
        currentUser?.email,
        companyId
      )
      toast.success(
        `${pendingMember.name} has been reactivated.`
      )
      await loadMembers()
    } catch (error) {
      console.error('Reactivate member error:', error)
      toast.error(
        error?.response?.data?.detail ||
        'Unable to reactivate member'
      )
    } finally {
      setShowReactivateModal(false)
      setPendingMember(null)
    }
  }

  const filteredMembers = members.filter(member => {
    const term = search.toLowerCase()
    return (
      member?.name?.toLowerCase().includes(term) ||
      member?.email?.toLowerCase().includes(term)
    )
  })

  const activeMembers = filteredMembers.filter(
    member => member.is_active !== false
  )

  const inactiveMembers = filteredMembers.filter(
    member => member.is_active === false
  )

  if (!currentUser) {
    return <h2>Loading user...</h2>
  }

  return (
    <div className="members-page">
      <h1>Company Members</h1>
      <p className="page-subtitle">
        Manage all users for {currentUser?.companyName || currentUser?.company || 'your company'}.
      </p>

      <div className="members-header">
        <input
          className="search-box"
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <p>Loading members...</p>}

      <section className="members-block">
        <h2>Active Members</h2>

        {activeMembers.length === 0 ? (
          <p>No active members found.</p>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Last Logout</th>
                <th>Browser</th>
                <th>IP Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeMembers.map(member => (
                <tr key={member.id || member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.last_login ? new Date(member.last_login).toLocaleString() : '-'}</td>
                  <td>{member.last_logout ? new Date(member.last_logout).toLocaleString() : '-'}</td>
                  <td>{member.browser_info || '-'}</td>
                  <td>{member.ip_address || '-'}</td>
                  <td>{member.role || 'User'}</td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  <td>
                    <button
                      className="danger-btn action-btn"
                      onClick={() => handleDeactivate(member)}
                    >
                      Deactivate
                    </button>
                    <button
                      className="secondary-btn action-btn"
                      onClick={() => handleSuspend(member)}
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="members-block">
        <h2>Suspended Members</h2>

        {inactiveMembers.length === 0 ? (
          <p>No suspended members found.</p>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Last Logout</th>
                <th>Browser</th>
                <th>IP Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inactiveMembers.map(member => (
                <tr key={member.id || member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.last_login ? new Date(member.last_login).toLocaleString() : '-'}</td>
                  <td>{member.last_logout ? new Date(member.last_logout).toLocaleString() : '-'}</td>
                  <td>{member.browser_info || '-'}</td>
                  <td>{member.ip_address || '-'}</td>
                  <td>{member.role || 'User'}</td>
                  <td>
                    <span className="status-badge suspended">Suspended</span>
                  </td>
                  <td>
                    <button
                      className="primary-btn action-btn"
                      onClick={() => handleReactivate(member)}
                    >
                      Reactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showSuspendModal && (
        <ConfirmModal
          title={`Suspend ${pendingMember?.name}`}
          message={`Suspend this user and block access to company modules until reactivation.`}
          onConfirm={confirmSuspend}
          onCancel={() => {
            setShowSuspendModal(false)
            setPendingMember(null)
            setDeactivationReason('')
          }}
          confirmText="Suspend"
          confirmClassName="suspend-confirm"
        >
          <div className="deactivation-reason-group">
            <label htmlFor="deactivationReason">Reason for suspension (optional)</label>
            <textarea
              id="deactivationReason"
              value={deactivationReason}
              onChange={e => setDeactivationReason(e.target.value)}
              rows={4}
              placeholder="Add an optional reason to help the employee and administrators understand this suspension."
            />
          </div>
        </ConfirmModal>
      )}

      {showReactivateModal && (
        <ConfirmModal
          title={`Reactivate ${pendingMember?.name}`}
          message={`Reactivate this user and restore system access.`}
          onConfirm={confirmReactivate}
          onCancel={() => {
            setShowReactivateModal(false)
            setPendingMember(null)
          }}
          confirmText="Reactivate"
          confirmClassName="reactivate-confirm"
        />
      )}
    </div>
  )
}

export default Members
