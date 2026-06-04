import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

// =========================
// FETCH AUDIT LOGS
// =========================
export const fetchAuditLogs = async () => {
  try {
    console.log('📡 Fetching audit logs...')

    const response = await axios.get(`${API_URL}/audit-logs`, {
      timeout: 8000,
    })

    console.log('✅ Audit Logs Response:', response.data)

    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error('❌ fetchAuditLogs error:', error.message)
    return []
  }
}