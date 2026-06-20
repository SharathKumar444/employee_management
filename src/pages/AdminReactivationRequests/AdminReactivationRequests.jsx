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
  const [errorMessage, setErrorMessage] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewAction, setReviewAction] = useState('')

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
      setErrorMessage('Unable to load reactivation requests.')
    } finally {
      setLoading(false)
    }
  }

  const openReviewModal = (request, action) => {
    setSelectedRequest(request)
    setReviewAction(action)
    setReviewComment('')
    setShowReviewModal(true)
    setErrorMessage('')
  }

  const closeReviewModal = () => {
    setShowReviewModal(false)
    setSelectedRequest(null)
    setReviewAction('')
    setReviewComment('')
    setErrorMessage('')
  }

  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewAction) {
      return
    }

    try {
      setActionLoading(selectedRequest.id)
      const res =
        reviewAction === 'approve'
          ? await approveRequest(selectedRequest.id, currentUser?.email, reviewComment)
          : await rejectRequest(selectedRequest.id, currentUser?.email, reviewComment)

      if (res?.success) {
        setSuccessMessage(
          reviewAction === 'approve'
            ? '✅ Reactivation approved successfully.'
            : '❌ Reactivation request rejected successfully.'
        )
        setTimeout(() => setSuccessMessage(''), 4000)
        closeReviewModal()
        await loadRequests()
      } else {
        setErrorMessage('Unable to submit review. Please try again.')
      }
    } catch (err) {
      console.error('Review error', err)
      setErrorMessage('Failed to submit review. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests = requests.filter(
    r => filterStatus === 'All' || r.status === filterStatus
  )

  const getUserInfo = request => request.user_email || `User #${request.user_id}`

  const pendingCount = requests.filter(r => r.status === 'Pending').length
  const approvedCount = requests.filter(r => r.status === 'Approved').length
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length

  return (
    <div className="admin-reactivation-page">
      <h1>Reactivation Requests</h1>
      <p className="page-subtitle">
        Review and manage account reinstatement requests for{' '}
        <strong>{currentUser?.companyName || currentUser?.company || 'your company'}</strong>
      </p>

      <div className="summary-grid">
        <div className="summary-card pending">
          <p>Pending</p>
          <strong>{pendingCount}</strong>
        </div>
        <div className="summary-card approved">
          <p>Approved</p>
          <strong>{approvedCount}</strong>
        </div>
        <div className="summary-card rejected">
          <p>Rejected</p>
          <strong>{rejectedCount}</strong>
        </div>
      </div>

      {successMessage && <div className="success-banner">{successMessage}</div>}
      {errorMessage && <div className="error-banner">{errorMessage}</div>}

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
                <th>Submitted</th>
                <th>Status</th>
                <th>Reviewer</th>
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
                  <td>{request.admin_reviewer || '-'}</td>
                  <td className="action-cell">
                    {request.status === 'Pending' ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => openReviewModal(request, 'approve')}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id && reviewAction === 'approve'
                            ? 'Processing...'
                            : 'Approve'}
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => openReviewModal(request, 'reject')}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id && reviewAction === 'reject'
                            ? 'Processing...'
                            : 'Reject'}
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

      {showReviewModal && selectedRequest && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <div className="review-modal-header">
              <div>
                <h2>
                  {reviewAction === 'approve'
                    ? 'Approve Reinstatement'
                    : 'Reject Reinstatement'}
                </h2>
                <p>
                  Request #{selectedRequest.id} from {getUserInfo(selectedRequest)}.
                </p>
              </div>
              <button className="modal-close" onClick={closeReviewModal}>
                ×
              </button>
            </div>

            <label htmlFor="reviewComment">Admin comment (optional)</label>
            <textarea
              id="reviewComment"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              rows={5}
              placeholder="Add an optional comment for the user."
            />

            {errorMessage && <div className="modal-error">{errorMessage}</div>}

            <div className="review-actions">
              <button className="secondary-btn" onClick={closeReviewModal}>
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleSubmitReview}
                disabled={actionLoading === selectedRequest.id}
              >
                {actionLoading === selectedRequest.id ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReactivationRequests
