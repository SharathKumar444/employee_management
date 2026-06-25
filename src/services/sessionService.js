import axios from 'axios'

const API_URL = 'http://localhost:8000/sessions'

const sessionService = {
  // Get all active sessions for a company
  getActiveSessions: async (companyId) => {
    try {
      const response = await axios.get(`${API_URL}/active`, {
        params: { company_id: companyId }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching active sessions:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  },

  // Get recent sessions for a company
  getRecentSessions: async (companyId, days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/recent`, {
        params: {
          company_id: companyId,
          days
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching recent sessions:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  },

  // Get session history for audit
  getSessionHistory: async (companyId, userEmail = null) => {
    try {
      const response = await axios.get(`${API_URL}/history`, {
        params: {
          company_id: companyId,
          user_email: userEmail
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching session history:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  },

  // Revoke a single session
  revokeSession: async (sessionId, companyId, adminEmail, reason = null) => {
    try {
      const response = await axios.post(`${API_URL}/${sessionId}/revoke`, {
        reason
      }, {
        params: {
          company_id: companyId,
          admin_email: adminEmail
        }
      })
      return response.data
    } catch (error) {
      console.error('Error revoking session:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  },

  // Revoke multiple sessions
  revokeMultipleSessions: async (sessionIds, companyId, adminEmail, reason = null) => {
    try {
      const response = await axios.post(`${API_URL}/revoke-multiple`, {
        session_ids: sessionIds,
        reason
      }, {
        params: {
          company_id: companyId,
          admin_email: adminEmail
        }
      })
      return response.data
    } catch (error) {
      console.error('Error revoking multiple sessions:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  },

  // Force logout a session
  forceLogout: async (sessionId, companyId, adminEmail, reason = null) => {
    try {
      const response = await axios.post(`${API_URL}/${sessionId}/force-logout`, {
        reason
      }, {
        params: {
          company_id: companyId,
          admin_email: adminEmail
        }
      })
      return response.data
    } catch (error) {
      console.error('Error force logging out session:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  },

  // Expire inactive sessions
  expireInactiveSessions: async (companyId, adminEmail, timeoutMinutes = 1440) => {
    try {
      const response = await axios.post(`${API_URL}/expire-inactive`, null, {
        params: {
          company_id: companyId,
          admin_email: adminEmail,
          timeout_minutes: timeoutMinutes
        }
      })
      return response.data
    } catch (error) {
      console.error('Error expiring inactive sessions:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  },

  // Get company session summary
  getCompanySummary: async (companyId) => {
    try {
      const response = await axios.get(`${API_URL}/company/${companyId}/summary`)
      return response.data
    } catch (error) {
      console.error('Error fetching session summary:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message
      }
    }
  }
}

export default sessionService
