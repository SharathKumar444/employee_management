import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import {
  createReactivationRequest,
  getReactivationRequests,
} from '../../services/reactivationService'
import './AccountDeactivated.css'

const AccountDeactivated = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requests, setRequests] = useState([])
  const [requestError, setRequestError] = useState('')
  const [loadingRequests, setLoadingRequests] = useState(false)

  const loadRequests = useCallback(async () => {
    if (!currentUser?.companyId || !currentUser?.id) {
      return
    }

    setLoadingRequests(true)
    try {
      const response = await getReactivationRequests(currentUser.companyId)
      if (response?.success && Array.isArray(response.data)) {
        setRequests(response.data)
      }
    } catch (error) {
      console.error('Failed to load reactivation requests:', error)
      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true })
      return
    }

    if (currentUser.is_active !== false) {
      navigate('/dashboard', { replace: true })
      return
    }

    const fetchRequests = async () => {
      await loadRequests()
    }

    void fetchRequests()
  }, [currentUser, navigate, loadRequests])

  const currentRequest = requests
    .filter(request => request.user_id === currentUser?.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleSubmitRequest = async () => {
    if (!currentUser?.companyId || !currentUser?.id) {
      setRequestError('Unable to determine your company context.')
      return
    }

    try {
      setSubmitting(true)
      setRequestError('')
      const response = await createReactivationRequest(
        currentUser.id,
        currentUser.companyId,
        reason
      )

      if (response?.success) {
        toast.success('Reinstatement request submitted successfully.')
        setShowModal(false)
        setReason('')
        await loadRequests()
      } else {
        setRequestError(response?.message || 'Unable to submit request.')
      }
    } catch (error) {
      console.error('Reactivation request failed:', error)
      setRequestError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Failed to submit reactivation request. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isSuspended = Boolean(currentUser?.deactivation_reason)
  const statusLabel = isSuspended ? 'Suspended' : 'Disabled'
  const titleLabel = isSuspended ? 'Account Suspended' : 'Account Disabled'
  const description = isSuspended
    ? 'Your account can still sign in, but access to company modules is currently blocked until an administrator reviews your reinstatement request.'
    : 'Your account has been disabled. Please contact your administrator or request reactivation to regain access.'

  return (
    <div className="deactivated-page">
      <div className="deactivated-panel">
        <section className="status-card">
          <div className="status-card-header">
            <span className={`status-badge ${isSuspended ? 'suspended' : 'disabled'}`}>
              {statusLabel}
            </span>
            <h1>{titleLabel}</h1>
          </div>

          <p className="status-description">
            {description}
          </p>

          <div className="deactivated-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => setShowModal(true)}
              disabled={currentRequest?.status === 'Pending'}
            >
              {currentRequest?.status === 'Pending'
                ? 'Request Pending'
                : 'Request Reinstatement'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleLogout}
            >
              Return to Login
            </button>
          </div>
        </section>

        <section className="details-card">
          <h2>{isSuspended ? 'Suspension details' : 'Deactivation details'}</h2>
          <div className="details-list">
            <div>
              <span>Status</span>
              <strong>{statusLabel}</strong>
            </div>
            <div>
              <span>{isSuspended ? 'Suspended by' : 'Disabled by'}</span>
              <strong>{currentUser?.deactivated_by || 'Administrator'}</strong>
            </div>
            <div>
              <span>{isSuspended ? 'Suspension date' : 'Deactivation date'}</span>
              <strong>
                {currentUser?.deactivated_at
                  ? new Date(currentUser.deactivated_at).toLocaleString()
                  : 'Unknown'}
              </strong>
            </div>
            <div>
              <span>Reason</span>
              <strong>
                {currentUser?.deactivation_reason || 'No reason provided.'}
              </strong>
            </div>
          </div>
        </section>

        <section className="request-card">
          <div className="request-card-header">
            <h2>Reinstatement request</h2>
            <span className={`status-pill ${currentRequest?.status?.toLowerCase() || 'none'}`}>
              {currentRequest?.status || 'No request submitted'}
            </span>
          </div>

          {loadingRequests ? (
            <p>Loading request history...</p>
          ) : currentRequest ? (
            <div className="request-card-body">
              <div className="request-row">
                <span>Submitted</span>
                <strong>
                  {new Date(currentRequest.created_at).toLocaleString()}
                </strong>
              </div>
              {currentRequest.reason && (
                <div className="request-row">
                  <span>Your message</span>
                  <strong>{currentRequest.reason}</strong>
                </div>
              )}
              {currentRequest.review_comment && (
                <div className="request-row">
                  <span>Admin response</span>
                  <strong>{currentRequest.review_comment}</strong>
                </div>
              )}
              {currentRequest.admin_reviewer && (
                <div className="request-row">
                  <span>Reviewed by</span>
                  <strong>{currentRequest.admin_reviewer}</strong>
                </div>
              )}
              {currentRequest.status === 'Pending' && (
                <p className="request-note">
                  Your reinstatement request is under review. You will be notified
                  once a decision is made.
                </p>
              )}
              {currentRequest.status === 'Rejected' && (
                <p className="request-note">
                  Your request was rejected. You may submit a new request if your
                  situation changes.
                </p>
              )}
            </div>
          ) : (
            <div className="request-card-body">
              <p>
                No reinstatement request has been submitted yet. Click the button
                above to send one to your administrator.
              </p>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="request-modal-overlay">
          <div className="request-modal">
            <div className="modal-header">
              <h2>Request Reinstatement</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <p className="modal-description">
              Send a reinstatement request to an administrator. Include an optional
              note explaining why you need access restored.
            </p>

            <label htmlFor="requestReason">Reason (optional)</label>
            <textarea
              id="requestReason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={5}
              placeholder="Briefly explain why you need your access restored."
            />

            {requestError && (
              <div className="modal-error">{requestError}</div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleSubmitRequest}
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountDeactivated
