import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import sessionService from '../../services/sessionService'
import { FaDesktop, FaMobileAlt, FaTabletAlt, FaTrash, FaSignOutAlt, FaSync, FaExclamationTriangle, FaDownload, FaHistory } from 'react-icons/fa'
import './SessionMonitoring.css'

const SessionMonitoring = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('sessions')
  const [activeSessions, setActiveSessions] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [revokeReason, setRevokeReason] = useState('')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [selectedSessionIds, setSelectedSessionIds] = useState([])
  
  // Filters
  const [searchUser, setSearchUser] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [browserFilter, setBrowserFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('7')

  const companyId = currentUser?.companyId || currentUser?.company_id
  const adminEmail = currentUser?.email

  useEffect(() => {
    if (currentUser?.role === 'admin' && companyId) {
      loadActiveSessions()
      loadRecentSessions()
      const interval = setInterval(() => {
        loadActiveSessions()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser, companyId])

  const loadActiveSessions = async () => {
    try {
      setLoading(true)
      const res = await sessionService.getActiveSessions(companyId)
      if (res?.success && res?.data) {
        setActiveSessions(res.data)
      }
    } catch (err) {
      console.error('Error loading active sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentSessions = async () => {
    try {
      const res = await sessionService.getRecentSessions(companyId, 30)
      if (res?.success && res?.data) {
        setRecentSessions(res.data)
      }
    } catch (err) {
      console.error('Error loading recent sessions:', err)
    }
  }

  // Calculate statistics
  const stats = {
    activeCount: activeSessions.filter(s => s.status === 'active').length,
    expiredCount: recentSessions.filter(s => s.status === 'expired').length,
    revokedCount: recentSessions.filter(s => s.status === 'revoked').length,
    loggedInToday: activeSessions.length + recentSessions.filter(s => {
      const today = new Date().toDateString()
      return new Date(s.login_time).toDateString() === today
    }).length
  }

  // Filtered sessions
  const getFilteredSessions = () => {
    let filtered = activeSessions

    if (searchUser) {
      filtered = filtered.filter(s =>
        s.user_email.toLowerCase().includes(searchUser.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    if (browserFilter !== 'all') {
      filtered = filtered.filter(s =>
        s.browser_info?.toLowerCase().includes(browserFilter.toLowerCase())
      )
    }

    return filtered
  }

  const filteredSessions = getFilteredSessions()

  const handleSessionSelect = (sessionId) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId))
    } else {
      setSelectedSessions([...selectedSessions, sessionId])
    }
  }

  const handleSelectAll = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([])
    } else {
      setSelectedSessions(filteredSessions.map(s => s.id))
    }
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleForceLogout = async (sessionId, reason) => {
    try {
      const res = await sessionService.forceLogout(
        sessionId,
        companyId,
        adminEmail,
        reason
      )

      if (res?.success) {
        showMessage('✅ Session force logged out successfully!', 'success')
        setSelectedSessions(selectedSessions.filter(id => id !== sessionId))
        await loadActiveSessions()
      } else {
        showMessage('❌ ' + (res?.message || 'Failed to force logout'), 'error')
      }
    } catch (err) {
      showMessage('❌ ' + (err.message || 'Failed to force logout'), 'error')
    }
  }

  const handleBulkRevoke = async () => {
    try {
      if (selectedSessions.length === 0) {
        showMessage('⚠️ Please select at least one session', 'warning')
        return
      }

      const res = await sessionService.revokeMultipleSessions(
        selectedSessions,
        companyId,
        adminEmail,
        revokeReason
      )

      if (res?.success) {
        showMessage(
          `✅ ${res.revoked_count} session(s) revoked successfully!`,
          'success'
        )
        setSelectedSessions([])
        setShowReasonModal(false)
        setRevokeReason('')
        await loadActiveSessions()
      } else {
        showMessage('❌ ' + (res?.message || 'Failed to revoke sessions'), 'error')
      }
    } catch (err) {
      showMessage('❌ ' + (err.message || 'Failed to revoke sessions'), 'error')
    }
  }

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <FaMobileAlt />
      case 'tablet':
        return <FaTabletAlt />
      default:
        return <FaDesktop />
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { icon: '🟢', label: 'Active', class: 'badge-active' },
      expired: { icon: '🟠', label: 'Expired', class: 'badge-expired' },
      revoked: { icon: '🔴', label: 'Revoked', class: 'badge-revoked' },
      logged_out: { icon: '⚪', label: 'Logged Out', class: 'badge-logged-out' }
    }
    const badge = badges[status] || badges.active
    return <span className={`status-badge ${badge.class}`}>{badge.icon} {badge.label}</span>
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const calculateInactivity = (lastActivityTime) => {
    const now = new Date()
    const lastActivity = new Date(lastActivityTime)
    const diffMinutes = Math.floor((now - lastActivity) / (1000 * 60))

    if (diffMinutes < 1) return 'Active now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const hours = Math.floor(diffMinutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="session-monitoring">
        <div className="no-access">
          <FaExclamationTriangle />
          <p>Admin access required to view sessions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="session-monitoring">
      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            User Sessions
          </button>
        </div>
      </div>

      {activeTab === 'sessions' && (
        <>
          {/* Header */}
          <div className="session-header">
            <h2>🔐 User Session Monitoring</h2>
            <p>Monitor and manage active user sessions within your organization</p>
          </div>

          {message && (
            <div className={`session-message message-${messageType}`}>
              {message}
            </div>
          )}

          {/* Analytics Cards */}
          <div className="session-analytics">
            <div className="analytics-card active">
              <div className="analytics-value">{stats.activeCount}</div>
              <div className="analytics-label">Active Sessions</div>
            </div>
            <div className="analytics-card expired">
              <div className="analytics-value">{stats.expiredCount}</div>
              <div className="analytics-label">Expired Sessions</div>
            </div>
            <div className="analytics-card revoked">
              <div className="analytics-value">{stats.revokedCount}</div>
              <div className="analytics-label">Revoked Sessions</div>
            </div>
            <div className="analytics-card today">
              <div className="analytics-value">{stats.loggedInToday}</div>
              <div className="analytics-label">Logged In Today</div>
            </div>
          </div>

          {/* Controls */}
          <div className="session-controls">
            <button
              className="control-btn refresh"
              onClick={loadActiveSessions}
              disabled={loading}
            >
              <FaSync /> {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              className="control-btn export"
              disabled={activeSessions.length === 0}
            >
              <FaDownload /> Export Sessions
            </button>
          </div>

          {/* Search & Filters */}
          <div className="filters-container">
            <div className="filter-group">
              <label>Search User:</label>
              <input
                type="text"
                placeholder="Enter username or email"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Browser:</label>
              <select
                value={browserFilter}
                onChange={(e) => setBrowserFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="edge">Edge</option>
                <option value="safari">Safari</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="1">Last 1 Day</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSessions.length > 0 && (
            <div className="bulk-actions-bar">
              <span>{selectedSessions.length} session(s) selected</span>
              <button
                className="bulk-revoke-btn"
                onClick={() => {
                  setSelectedSessionIds(selectedSessions)
                  setShowReasonModal(true)
                }}
              >
                <FaTrash /> Revoke Selected Sessions
              </button>
            </div>
          )}

          {/* Active Sessions Table */}
          <div className="sessions-table-container">
            <h3>Active Sessions</h3>
            {filteredSessions.length === 0 ? (
              <div className="no-data">
                <p>No active sessions found</p>
              </div>
            ) : (
              <div className="sessions-table">
                <div className="table-header">
                  <div className="col checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                  <div className="col user">User</div>
                  <div className="col login-time">Login Time</div>
                  <div className="col last-activity">Last Activity</div>
                  <div className="col browser">Browser</div>
                  <div className="col ip">IP Address</div>
                  <div className="col status">Status</div>
                  <div className="col action">Action</div>
                </div>

                {filteredSessions.map((session) => (
                  <div key={session.id} className="table-row">
                    <div className="col checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSessions.includes(session.id)}
                        onChange={() => handleSessionSelect(session.id)}
                      />
                    </div>
                    <div className="col user">
                      <span className="user-name">{session.user_email}</span>
                      <span className="device-info">{getDeviceIcon(session.device_type)} {session.device_type}</span>
                    </div>
                    <div className="col login-time">
                      {new Date(session.login_time).toLocaleString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="col last-activity">
                      {calculateInactivity(session.last_activity_time)}
                    </div>
                    <div className="col browser">{session.browser_info}</div>
                    <div className="col ip">{session.ip_address}</div>
                    <div className="col status">
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="col action">
                      <button
                        className="action-btn force-logout"
                        onClick={() => {
                          setSelectedSessionIds([session.id])
                          setSelectedAction('force-logout')
                          setShowReasonModal(true)
                        }}
                      >
                        <FaSignOutAlt /> Force Logout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session History */}
          <div className="sessions-table-container">
            <h3><FaHistory /> Session History</h3>
            {recentSessions.length === 0 ? (
              <div className="no-data">
                <p>No recent sessions</p>
              </div>
            ) : (
              <div className="sessions-table">
                <div className="table-header">
                  <div className="col user">User</div>
                  <div className="col login-time">Login Time</div>
                  <div className="col logout-time">Logout Time</div>
                  <div className="col browser">Browser</div>
                  <div className="col ip">IP Address</div>
                  <div className="col status">Session Status</div>
                </div>

                {recentSessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="table-row">
                    <div className="col user">{session.user_email}</div>
                    <div className="col login-time">
                      {new Date(session.login_time).toLocaleDateString()}
                    </div>
                    <div className="col logout-time">
                      {session.logout_time ? new Date(session.logout_time).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="col browser">{session.browser_info}</div>
                    <div className="col ip">{session.ip_address}</div>
                    <div className="col status">
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {selectedAction === 'force-logout'
                ? '🚪 Force Logout Session'
                : '🔐 Revoke Session'}
            </h3>

            <p>
              {selectedAction === 'force-logout'
                ? `Are you sure you want to force logout ${selectedSessionIds.length} session(s)?`
                : `Are you sure you want to revoke ${selectedSessionIds.length} session(s)?`}
            </p>

            {selectedSessionIds.length <= 3 && (
              <div className="affected-users">
                <strong>Affected Users:</strong>
                <ul>
                  {activeSessions
                    .filter(s => selectedSessionIds.includes(s.id))
                    .map(s => (
                      <li key={s.id}>{s.user_email}</li>
                    ))}
                </ul>
              </div>
            )}

            <div className="modal-form">
              <label>Reason (Optional):</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Provide a reason for this action..."
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowReasonModal(false)
                  setRevokeReason('')
                  setSelectedAction(null)
                  setSelectedSessionIds([])
                }}
              >
                Cancel
              </button>

              <button
                className="btn-confirm"
                onClick={() => {
                  if (selectedAction === 'force-logout') {
                    if (selectedSessionIds.length === 1) {
                      handleForceLogout(selectedSessionIds[0], revokeReason)
                    }
                  } else {
                    handleBulkRevoke()
                  }
                  setShowReasonModal(false)
                  setRevokeReason('')
                  setSelectedAction(null)
                  setSelectedSessionIds([])
                }}
              >
                {selectedAction === 'force-logout' ? 'Force Logout' : 'Revoke Sessions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionMonitoring
