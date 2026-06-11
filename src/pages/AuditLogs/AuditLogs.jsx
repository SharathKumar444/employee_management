import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchAuditLogs } from '../../services/auditService'
import './AuditLogs.css'

const AuditLogs = () => {
  const { currentUser } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser) {
      return
    }

    const loadLogs = async () => {
      try {
        setLoading(true)
        setError('')

        const companyId = currentUser?.companyId || currentUser?.company_id
        if (!companyId) {
          setError('Unable to load audit logs: missing company context')
          return
        }

        const data = await fetchAuditLogs(companyId)
        setLogs(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load audit logs')
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [currentUser])

  if (loading) {
    return (
      <div className="status-container">
        <h2>Loading audit logs...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  return (
    <div className="audit-page">
      <h1>Audit Logs</h1>

      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Action</th>
              <th>Related User</th>
              <th>Role</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.performed_by || log.userName || 'Unknown'}</td>
                  <td>{log.action}</td>
                  <td>{log.target_user || log.relatedUser || '-'}</td>
                  <td>{log.company_id || log.role || '-'}</td>
                  <td>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditLogs