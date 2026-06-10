import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  createReactivationRequest,
  getReactivationRequests,
} from '../../services/reactivationService'
import './Reactivation.css'

const Reactivation = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [requests, setRequests] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const companyId =
    currentUser?.companyId ||
    currentUser?.company_id

  // ================= REDIRECT LOGIC =================

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true })
      return
    }

    if (currentUser.is_active !== false) {
      navigate('/dashboard', { replace: true })
      return
    }

    // Load reactivation requests when page loads
    loadRequests()
  }, [currentUser, navigate, companyId])

  // ================= LOAD REQUESTS =================

  const loadRequests = async () => {
    if (!companyId) return

    try {
      setLoadingRequests(true)
      const response = await getReactivationRequests(companyId)

      if (response?.success && response?.data) {
        setRequests(response.data)
        // Check if user has any submitted requests
        const userRequest = response.data.find(
          r => r.user_id === currentUser?.id
        )
        if (userRequest) {
          setSubmitted(true)
          setSubmitStatus(`Request status: ${userRequest.status}`)
        }
      }
    } catch (error) {
      console.error('Load requests error:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  // ================= SUBMIT REQUEST =================

  const handleRequest = async () => {
    if (!companyId) {
      setSubmitStatus('Unable to determine company context.')
      return
    }

    const userId = currentUser?.id || currentUser?.user_id
    if (!userId) {
      setSubmitStatus('Unable to submit request without a valid user identifier.')
      return
    }

    try {
      setLoading(true)
      const response = await createReactivationRequest(userId, companyId)

      if (response?.success) {
        setSubmitStatus('✅ Reactivation request submitted successfully.')
        setSubmitted(true)
        await loadRequests()
      } else {
        setSubmitStatus(
          response?.message || '❌ Unable to submit request.'
        )
      }
    } catch (error) {
      console.error('Reactivation request error:', error)
      setSubmitStatus(
        error.response?.data?.message ||
        '❌ Failed to submit reactivation request. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reactivation-page">
      <div className="reactivation-card">
        <h1>Account Reactivation</h1>

        {/* ================= STATUS SECTION ================= */}
        <section className="status-section">
          <h2>Account Status</h2>
          <div className="status-info">
            <p>
              <strong>Email:</strong> {currentUser?.email}
            </p>
            <p>
              <strong>Company:</strong> {currentUser?.companyName || currentUser?.company || 'N/A'}
            </p>
            <p>
              <strong>Status:</strong>
              <span className="status-badge inactive">Inactive</span>
            </p>
          </div>
        </section>

        {/* ================= REQUEST SECTION ================= */}
        <section className="request-section">
          <h2>Submit Reactivation Request</h2>
          <p>
            Your account is currently inactive. Submit a reactivation request and an
            administrator will review it shortly.
          </p>

          {submitStatus && (
            <div
              className={`status-message ${
                submitStatus.includes('✅') ? 'success' : 'error'
              }`}
            >
              {submitStatus}
            </div>
          )}

          <button
            className="primary-btn"
            onClick={handleRequest}
            disabled={loading || submitted}
          >
            {loading ? 'Submitting...' : submitted ? 'Request Submitted' : 'Send Request'}
          </button>
        </section>

        {/* ================= REQUEST HISTORY ================= */}
        <section className="history-section">
          <h2>Request History</h2>
          {loadingRequests ? (
            <p>Loading request history...</p>
          ) : requests.length === 0 ? (
            <p>No reactivation requests found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter(r => r.user_id === currentUser?.id)
                    .map(request => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td>
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
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
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================= INFO ================= */}
        <section className="info-section">
          <h3>What Happens Next?</h3>
          <ul>
            <li>Your reactivation request will be sent to your administrator.</li>
            <li>The administrator will review your request and approve or reject it.</li>
            <li>You will be able to log in once your account is reactivated.</li>
            <li>Check this page for updates on your request status.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default Reactivation
