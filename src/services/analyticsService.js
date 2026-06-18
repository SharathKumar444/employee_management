import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const fetchDashboardAnalytics =
  async (companyId) => {
    if (!companyId) {
      return {
        activeSessions: 0,
        newDevicesToday: 0,
      }
    }

    try {
      const response =
        await axios.get(
          `${API_URL}/analytics/dashboard`,
          {
            params: {
              company_id: companyId,
            },
          }
        )

      return response.data
    } catch (error) {
      console.error(
        '❌ fetchDashboardAnalytics error:',
        error?.response?.data || error.message || error
      )

      return {
        activeSessions: 0,
        newDevicesToday: 0,
      }
    }
  }
