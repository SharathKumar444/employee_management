import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchActivityUsers, fetchActivityUserDetails } from '../../services/activityService'
import { fetchAuditLogs } from '../../services/auditService'
import './ActivityTracking.css'

const ActivityTracking = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(true)
  const [error, setError] = useState('')

  const companyId = currentUser?.companyId || currentUser?.company_id

  const loadUsers = async () => {
    if (!companyId) {
      setUsers([])
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await fetchActivityUsers(companyId)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Activity tracking load error:', err)
      setError('Unable to load user activity data')
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    if (!companyId) {
      setAuditLogs([])
      return
    }

    try {
      setAuditLoading(true)
      const data = await fetchAuditLogs(companyId)
      setAuditLogs(Array.isArray(data) ? data.slice(0, 6) : [])
    } catch (err) {
      console.error('Audit log load error:', err)
      setAuditLogs([])
    } finally {
      setAuditLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadAuditLogs()
  }, [companyId])

  const openUserDetails = async user => {
    if (!companyId || !user?.id) {
      return
    }

    try {
      const details = await fetchActivityUserDetails(user.id, companyId)
      setSelectedUser(details)
    } catch (err) {
      console.error('Failed to load activity details:', err)
      setSelectedUser(null)
    }
  }

  const closeDetails = () => {
    setSelectedUser(null)
  }

  const counts = useMemo(() => {
    const active = users.filter(user => user.status === 'Active').length
    const offline = users.filter(user => user.status !== 'Active').length
    const newIp = users.filter(user => user.is_new_ip).length
    const newDevice = users.filter(user => user.is_new_device).length

    return { active, offline, newIp, newDevice }
  }, [users])

  const statusLabel = useMemo(
    () => ({
      Active: 'Active',
      Offline: 'Offline',
    }),
    []
  )

  const warningItems = useMemo(
    () => auditLogs.filter(
      (entry) =>
        entry.action?.includes('New Device Detected') ||
        entry.action?.includes('New IP Address Detected')
    ),
    [auditLogs]
  )

  if (loading) {
    return (
      <div className="activity-page status-container">
        <h2>Loading activity tracking...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="activity-page status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  return (
    <div className="activity-page">
      <div className="activity-header">
        <div>
          <h1>Activity Tracking</h1>
          <p>
            Track employee login sessions, device and IP changes, and review audit events across your company.
          </p>
        </div>
      </div>

      <div className="activity-summary-grid">
        <div className="activity-card">
          <p className="card-title">Active Users</p>
          <p className="card-value">{counts.active}</p>
          <p className="card-subtitle">Currently active employees with recent activity.</p>
        </div>
        <div className="activity-card">
          <p className="card-title">Offline Users</p>
          <p className="card-value">{counts.offline}</p>
          <p className="card-subtitle">Users who are currently offline or have not logged in recently.</p>
        </div>
        <div className="activity-card">
          <p className="card-title">New IPs</p>
          <p className="card-value">{counts.newIp}</p>
          <p className="card-subtitle">Devices that logged in from a new IP address.</p>
        </div>
        <div className="activity-card">
          <p className="card-title">New Devices</p>
          <p className="card-value">{counts.newDevice}</p>
          <p className="card-subtitle">Devices that were not previously seen for the user.</p>
        </div>
      </div>

      <div className="warning-row">
        <div className="warning-card">
          <div>
            <p className="warning-label">Security Alerts</p>
            <p className="warning-count">{warningItems.length || counts.newDevice + counts.newIp}</p>
          </div>
          <p className="warning-text">
            {warningItems.length > 0
              ? 'Detected suspicious activity from new devices or IP addresses. Review recent audit events below.'
              : 'No suspicious login changes found in recent audit entries.'}
          </p>
        </div>
      </div>

      <div className="activity-main-grid">
        <section className="activity-panel">
          <div className="panel-title">
            <h2>User Activity</h2>
            <p>Latest login/logout session details for your company users.</p>
          </div>

          <div className="activity-table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Last Login</th>
                  <th>Browser</th>
                  <th>IP</th>
                  <th>New Device</th>
                  <th>New IP</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id || user.email}>
                      <td>{user.name || 'Unknown'}</td>
                      <td>{user.email}</td>
                      <td>{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</td>
                      <td>{user.browser || '-'}</td>
                      <td>{user.ip_address || '-'}</td>
                      <td>
                        <span className={user.is_new_device ? 'status-pill warning' : 'status-pill normal'}>
                          {user.is_new_device ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={user.is_new_ip ? 'status-pill warning' : 'status-pill normal'}>
                          {user.is_new_ip ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={user.status === 'Active' ? 'status-badge active' : 'status-badge offline'}>
                          {statusLabel[user.status] || user.status}
                        </span>
                      </td>
                      <td>
                        <button className="secondary-btn" onClick={() => openUserDetails(user)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="table-empty">
                      No user activity found for this company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="audit-panel">
          <div className="panel-title">
            <h2>Recent Audit Logs</h2>
            <p>Security and activity events related to device/IP changes and user actions.</p>
          </div>

          {auditLoading ? (
            <div className="status-container">
              <h3>Loading audit events...</h3>
            </div>
          ) : (
            <div className="audit-table-container">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className={
                        log.action?.includes('New Device Detected') ||
                        log.action?.includes('New IP Address Detected')
                          ? 'highlight-row'
                          : ''
                      }>
                        <td>{log.performed_by || 'System'}</td>
                        <td>{log.action}</td>
                        <td>{log.details || log.target_user || '-'}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="table-empty">
                        No recent audit logs available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedUser && (
        <div className="activity-modal-overlay" onClick={closeDetails}>
          <div className="activity-modal" onClick={e => e.stopPropagation()}>
            <div className="activity-modal-header">
              <div>
                <h2>{selectedUser.name} Activity Details</h2>
                <p>{selectedUser.email}</p>
              </div>
              <button className="close-btn" onClick={closeDetails}>×</button>
            </div>

            <div className="activity-detail-grid">
              <div className="detail-item">
                <span>Name</span>
                <strong>{selectedUser.name}</strong>
              </div>
              <div className="detail-item">
                <span>Email</span>
                <strong>{selectedUser.email}</strong>
              </div>
              <div className="detail-item">
                <span>Company</span>
                <strong>{selectedUser.company || selectedUser.company_id}</strong>
              </div>
              <div className="detail-item">
                <span>Last Login</span>
                <strong>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : '-'}</strong>
              </div>
              <div className="detail-item">
                <span>Last Logout</span>
                <strong>{selectedUser.last_logout ? new Date(selectedUser.last_logout).toLocaleString() : '-'}</strong>
              </div>
              <div className="detail-item">
                <span>Browser</span>
                <strong>{selectedUser.browser || '-'}</strong>
              </div>
              <div className="detail-item">
                <span>Operating System</span>
                <strong>{selectedUser.os || '-'}</strong>
              </div>
              <div className="detail-item">
                <span>IP Address</span>
                <strong>{selectedUser.ip_address || '-'}</strong>
              </div>
              <div className="detail-item">
                <span>Device Type</span>
                <strong>{selectedUser.device_type || '-'}</strong>
              </div>
              <div className="detail-item">
                <span>New Device Detected</span>
                <strong>{selectedUser.is_new_device ? 'Yes' : 'No'}</strong>
              </div>
              <div className="detail-item">
                <span>New IP Detected</span>
                <strong>{selectedUser.is_new_ip ? 'Yes' : 'No'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityTracking
