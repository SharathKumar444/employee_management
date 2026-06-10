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

  // ================= LOAD REQUESTS =================

  useEffect(() => {
    if (companyId) {
      loadRequests()
    }
  }, [companyId])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await getReactivationRequests(companyId)

      if (response?.success && response?.data) {
        setRequests(response.data)
      }
    } catch (error) {
      console.error('Load requests error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ================= APPROVE REQUEST =================

  const handleApprove = async requestId => {
    try {
      setActionLoading(requestId)
      const response = await approveRequest(requestId, currentUser?.email)

      if (response?.success) {
        setSuccessMessage('✅ Reactivation approved successfully')
        await loadRequests()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Approve error:', error)
      alert('Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }

  // ================= REJECT REQUEST =================

  const handleReject = async requestId => {
    try {
      setActionLoading(requestId)
      const response = await rejectRequest(requestId, currentUser?.email)

      if (response?.success) {
        setSuccessMessage('❌ Reactivation request rejected')
        await loadRequests()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Reject error:', error)
      alert('Failed to reject request')
    } finally {
      setActionLoading(null)
    }
  }

  // ================= FILTER REQUESTS =================

  const filteredRequests = requests.filter(
    req => filterStatus === 'All' || req.status === filterStatus
  )

  // ================= GET USER INFO =================

  const getUserInfo = (request) => {
    return request.user_email || `User #${request.user_id}`
  }

  return (
    <div className="admin-reactivation-page">
      <h1>Reactivation Requests</h1>
      <p className="page-subtitle">
        Review and manage account reactivation requests for{' '}
        <strong>{currentUser?.companyName || currentUser?.company || 'your company'}</strong>
      </p>

      {/* ================= SUCCESS MESSAGE ================= */}
      {successMessage && (
        <div className="success-banner">
          {successMessage}
        </div>
      )}

      {/* ================= FILTER SECTION ================= */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* ================= REQUESTS TABLE ================= */}
      {loading ? (
        <p>Loading reactivation requests...</p>\n      ) : filteredRequests.length === 0 ? (\n        <div className=\"empty-state\">\n          <p>\n            {filterStatus === 'All'\n              ? 'No reactivation requests found.'\n              : `No ${filterStatus.toLowerCase()} requests found.`}\n          </p>\n        </div>\n      ) : (\n        <div className=\"table-wrap\">\n          <table className=\"requests-table\">\n            <thead>\n              <tr>\n                <th>Request ID</th>\n                <th>User</th>\n                <th>Submitted Date</th>\n                <th>Status</th>\n                <th>Action</th>\n              </tr>\n            </thead>\n            <tbody>\n              {filteredRequests.map(request => (\n                <tr key={request.id}>\n                  <td>#{request.id}</td>\n                  <td>{getUserInfo(request.user_id)}</td>\n                  <td>{new Date(request.created_at).toLocaleDateString()}</td>\n                  <td>\n                    <span\n                      className={`status-badge ${\n                        request.status === 'Approved'\n                          ? 'approved'\n                          : request.status === 'Rejected'\n                            ? 'rejected'\n                            : 'pending'\n                      }`}\n                    >\n                      {request.status}\n                    </span>\n                  </td>\n                  <td className=\"action-cell\">\n                    {request.status === 'Pending' ? (\n                      <>\n                        <button\n                          className=\"approve-btn\"\n                          onClick={() => handleApprove(request.id)}\n                          disabled={actionLoading === request.id}\n                        >\n                          {actionLoading === request.id ? 'Processing...' : 'Approve'}\n                        </button>\n                        <button\n                          className=\"reject-btn\"\n                          onClick={() => handleReject(request.id)}\n                          disabled={actionLoading === request.id}\n                        >\n                          {actionLoading === request.id ? 'Processing...' : 'Reject'}\n                        </button>\n                      </>\n                    ) : (\n                      <span className=\"completed\">{request.status}</span>\n                    )}\n                  </td>\n                </tr>\n              ))}\n            </tbody>\n          </table>\n        </div>\n      )}\n\n      {/* ================= STATS ================= */}\n      <div className=\"stats-section\">\n        <div className=\"stat-card\">\n          <h3>Pending</h3>\n          <p className=\"stat-number\">\n            {requests.filter(r => r.status === 'Pending').length}\n          </p>\n        </div>\n        <div className=\"stat-card\">\n          <h3>Approved</h3>\n          <p className=\"stat-number\">\n            {requests.filter(r => r.status === 'Approved').length}\n          </p>\n        </div>\n        <div className=\"stat-card\">\n          <h3>Rejected</h3>\n          <p className=\"stat-number\">\n            {requests.filter(r => r.status === 'Rejected').length}\n          </p>\n        </div>\n      </div>\n    </div>\n  )
}

export default AdminReactivationRequests
