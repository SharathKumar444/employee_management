import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

// =========================
// TRANSFER EMPLOYEE
// =========================
export const transferEmployee = async (
  employeeId,
  toDepartment,
  reason,
  performedBy
) => {
  try {
    console.log(
      '🔄 Transfer Employee Request:',
      {
        employeeId,
        toDepartment,
        reason,
        performedBy,
      }
    )

    const response = await axios.put(
      `${API_URL}/employees/${employeeId}?performed_by=${encodeURIComponent(performedBy)}`,
      {
        department: toDepartment,
      }
    )

    return response.data
  } catch (error) {
    console.error(
      '❌ transferEmployee error:',
      error.response?.data || error
    )
    throw error
  }
}

// =========================
// GET AUDIT LOGS
// =========================
export const fetchAuditLogs = async (
  company_id
) => {
  try {
    console.log(
      '📋 Fetching audit logs for company:',
      company_id
    )

    const response = await axios.get(
      `${API_URL}/audit-logs`,
      {
        params: { company_id },
        timeout: 8000,
      }
    )

    console.log(
      '✅ Audit Logs Response:',
      response.data
    )

    if (Array.isArray(response.data)) {
      return response.data
    }

    if (
      response.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error(
      '❌ fetchAuditLogs error:',
      error
    )
    return []
  }
}

// =========================
// GET NOTIFICATIONS
// =========================
export const fetchNotifications = async (
  userId
) => {
  try {
    console.log(
      '🔔 Fetching notifications for user:',
      userId
    )

    const response = await axios.get(
      `${API_URL}/notifications/`,
      {
        params: { user_id: userId },
        timeout: 8000,
      }
    )

    console.log(
      '✅ Notifications Response:',
      response.data
    )

    if (Array.isArray(response.data)) {
      return response.data
    }

    if (
      response.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error(
      '❌ fetchNotifications error:',
      error
    )
    return []
  }
}
