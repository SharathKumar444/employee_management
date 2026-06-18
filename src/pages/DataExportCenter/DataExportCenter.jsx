import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  FaDownload,
  FaHistory,
  FaFileAlt,
  FaFileExcel,
  FaFilePdf,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa'
import {
  fetchAvailableExportTypes,
  exportData,
  fetchExportHistory,
} from '../../services/exportService'
import './DataExportCenter.css'

const DataExportCenter = () => {
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useAuth()

  // State management
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Export configuration
  const [availableTypes, setAvailableTypes] = useState([])
  const [availableFormats, setAvailableFormats] = useState([])
  const [selectedType, setSelectedType] = useState('employees')
  const [selectedFormat, setSelectedFormat] = useState('csv')

  // Export history
  const [exportHistory, setExportHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadExportOptions()
    // eslint-disable-next-line react-hooks/immutability
    loadExportHistory()
  }, [])

  const loadExportOptions = async () => {
    try {
      setLoading(true)
      const result = await fetchAvailableExportTypes()

      if (result.success) {
        setAvailableTypes(result.types)
        setAvailableFormats(result.formats)
        setSelectedType(result.types[0] || 'employees')
        setSelectedFormat(result.formats[0] || 'csv')
      } else {
        setError(result.error || 'Failed to load export options')
      }
    } catch (err) {
      setError('Error loading export options')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadExportHistory = async () => {
    try {
      setHistoryLoading(true)
      const result = await fetchExportHistory(100)

      if (result.success) {
        setExportHistory(result.history)
      } else {
        console.error('Failed to load history:', result.error)
      }
    } catch (err) {
      console.error('Error loading export history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleExport = async (
    type = selectedType,
    format = selectedFormat
  ) => {
    if (!type || !format) {
      setError('Please select both data type and format')
      return
    }

    try {
      setExporting(true)
      setError('')
      setSuccess('')

      const result = await exportData(type, format)

      if (result.success) {
        const messageMap = {
          employees: '✅ Employees exported successfully',
          attendance: '✅ Attendance report generated',
          analytics: '✅ Analytics report downloaded',
        }

        setSuccess(messageMap[type] || `${renderExportTypeName(type)} exported successfully`)
        // Refresh history
        await loadExportHistory()
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(result.error || 'Export failed')
      }
    } catch (err) {
      setError('Error during export: ' + err.message)
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const getFormatIcon = (format) => {
    switch (format) {
      case 'excel':
        return <FaFileExcel className="format-icon excel" />
      case 'pdf':
        return <FaFilePdf className="format-icon pdf" />
      case 'csv':
      default:
        return <FaFileAlt className="format-icon csv" />
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return date.toLocaleString('en-GB', options)
  }

  const renderExportTypeName = (type) => {
    switch (type) {
      case 'employees':
        return 'Employees'
      case 'attendance':
        return 'Attendance'
      case 'leaves':
        return 'Leave Requests'
      case 'audit_logs':
        return 'Audit Logs'
      case 'notifications':
        return 'Notifications'
      case 'analytics':
        return 'Analytics'
      default:
        return type
          .split('_')
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join(' ')
    }
  }

  if (loading) {
    return (
      <div className="export-center-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Loading export options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="export-center-container">
      {/* Header */}
      <div className="export-header">
        <h1>Data Export Center</h1>
        <p>Company A - Admin Dashboard</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* Main Export Section */}
      <div className="export-section">
        <div className="section-card">
          <h2>
            <FaDownload /> Export Data
          </h2>

          <div className="export-form">
            {/* Data Type Selection */}
            <div className="form-group">
              <label>
                <strong>Select Data Type</strong>
              </label>
              <div className="export-type-grid">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`export-type-card ${selectedType === type ? 'active' : ''}`}
                    onClick={() => setSelectedType(type)}
                    disabled={exporting}
                  >
                    {renderExportTypeName(type)}
                  </button>
                ))}
              </div>
              <small className="form-text">
                Select the data category for export
              </small>
            </div>

            {/* Format Selection */}
            <div className="form-group">
              <label htmlFor="export-format">
                <strong>Select Format</strong>
              </label>
              <div className="format-options">
                {availableFormats.map((format) => (
                  <label
                    key={format}
                    className={`format-option ${selectedFormat === format ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={selectedFormat === format}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      disabled={exporting}
                    />
                    <span className="format-label">
                      {getFormatIcon(format)}
                      {format.toUpperCase()}
                    </span>
                  </label>
                ))}
              </div>
              <small className="form-text">
                Choose the file format for your export
              </small>
            </div>

            <div className="form-group">
              <label>
                <strong>Select Export Type</strong>
              </label>
              <div className="export-type-grid">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`export-type-card ${selectedType === type ? 'active' : ''}`}
                    onClick={() => setSelectedType(type)}
                    disabled={exporting}
                  >
                    {renderExportTypeName(type)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleExport()}
              disabled={exporting || !selectedType || !selectedFormat}
              className="btn btn-primary export-btn"
            >
              {exporting ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  Exporting...
                </>
              ) : (
                <>
                  <FaDownload />
                  Export Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Export Data Types Info */}
        <div className="section-card">
          <h2>
            <FaFileAlt /> Available Exports
          </h2>
          <div className="available-exports-list">
            <div className="export-item">👥 Employees</div>
            <div className="export-item">📅 Attendance</div>
            <div className="export-item">📝 Leave Requests</div>
            <div className="export-item">📜 Audit Logs</div>
            <div className="export-item">🔔 Notifications</div>
            <div className="export-item">📈 Analytics</div>
          </div>
        </div>
      </div>

      {/* Export History Section */}
      <div className="export-section">
        <div className="section-card">
          <h2>
            <FaHistory /> Export History
          </h2>
          <p className="section-subtitle">Download Previous Reports</p>

          {historyLoading ? (
            <div className="loading-spinner">
              <FaSpinner className="spinner" />
              <p>Loading export history...</p>
            </div>
          ) : exportHistory.length === 0 ? (
            <div className="empty-state">
              <p>No exports yet. Start by exporting data above!</p>
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Exported By</th>
                    <th>Data Type</th>
                    <th>Format</th>
                    <th>Date & Time</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {exportHistory.map((record) => (
                    <tr key={record.id}>
                      <td>{record.exported_by_email}</td>
                      <td>{renderExportTypeName(record.data_type)}</td>
                      <td>
                        <span className="format-badge">
                          {getFormatIcon(record.export_format)}
                          {record.export_format.toUpperCase()}
                        </span>
                      </td>
                      <td className="timestamp">
                        {formatDateTime(record.created_at)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleExport(record.data_type, record.export_format)}
                          className="btn btn-secondary history-download-btn"
                          disabled={exporting}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="history-actions">
            <button
              onClick={loadExportHistory}
              disabled={historyLoading}
              className="btn btn-secondary"
            >
              {historyLoading ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  Refreshing...
                </>
              ) : (
                <>
                  <FaHistory />
                  Refresh History
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="info-box">
        <h3>About Data Exports</h3>
        <ul>
          <li>
            <strong>Security:</strong> All exports are company-scoped and only
            admins can access them
          </li>
          <li>
            <strong>Audit Trail:</strong> Every export is logged with who,
            when, and what was exported
          </li>
          <li>
            <strong>Formats:</strong> Choose CSV for spreadsheets, Excel for
            advanced formatting, or PDF for printing
          </li>
          <li>
            <strong>Data Range:</strong> Attendance records show last 30 days,
            Audit logs show last 90 days
          </li>
          <li>
            <strong>Export History:</strong> Previous downloads are stored for
            audit and recovery.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default DataExportCenter
