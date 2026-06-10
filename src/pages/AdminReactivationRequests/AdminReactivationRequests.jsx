import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getReactivationRequests,
  approveRequest,
  rejectRequest,
} from '../../services/reactivationService'
import './AdminReactivationRequests.css'

const AdminReactivationRequests = () => {
  const { currentUser } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [filterStatus, setFilterStatus] = useState('Pending')
  const [successMessage, setSuccessMessage] = useState('')

  const companyId =
    currentUser?.companyId ||
    currentUser?.company_id

  useEffect(() => {
    if (companyId) loadRequests()
  }, [companyId])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const res = await getReactivationRequests(companyId)
      if (res?.success) setRequests(res.data)
    } catch (err) {
      console.error('Load requests error', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async requestId => {
    const comment = window.prompt('Optional comment for this approval:')
    try {
      setActionLoading(requestId)
      const res = await approveRequest(requestId, currentUser?.email, comment)
      if (res?.success) {
        setSuccessMessage('✅ Reactivation approved successfully')
        await loadRequests()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      console.error('Approve error', err)
      alert('Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async requestId => {
    const comment = window.prompt('Optional comment for this rejection:')
    try {
      setActionLoading(requestId)
      const res = await rejectRequest(requestId, currentUser?.email, comment)
      if (res?.success) {
        setSuccessMessage('❌ Reactivation request rejected')
        await loadRequests()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      console.error('Reject error', err)
      alert('Failed to reject request')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests = requests.filter(
    r => filterStatus === 'All' || r.status === filterStatus
  )

  const getUserInfo = request => request.user_email || `User #${request.user_id}`

  return (
    <div className="admin-reactivation-page">
      <h1>Reactivation Requests</h1>
      <p className="page-subtitle">
        Review and manage account reactivation requests for{' '}
        <strong>{currentUser?.companyName || currentUser?.company || 'your company'}</strong>
      </p>

      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="filter-section">
        <label>Filter by Status:</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p>Loading reactivation requests...</p>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>
            {filterStatus === 'All'
              ? 'No reactivation requests found.'
              : `No ${filterStatus.toLowerCase()} requests found.`}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>User</th>
                <th>Reason</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td>{getUserInfo(request)}</td>
                  <td className="reason-cell">{request.reason || '-'}</td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        request.status === 'Approved'
                          ? 'approved'
                          : request.status === 'Rejected'
                          ? 'rejected'
                          : 'pending'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    {request.status === 'Pending' ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    ) : (
                      <span className="small-muted">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminReactivationRequests
