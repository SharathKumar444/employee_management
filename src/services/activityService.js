import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

export const fetchActivityUsers = async (companyId) => {
  try {
    const response = await api.get('/activity-tracking', {
      params: { company_id: companyId },
    })

    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error('fetchActivityUsers error:', error)
    return []
  }
}

export const fetchActivityUserDetails = async (
  userId,
  companyId
) => {
  try {
    const response = await api.get(
      `/activity-tracking/${userId}`,
      {
        params: { company_id: companyId },
      }
    )

    return response.data?.data || null
  } catch (error) {
    console.error('fetchActivityUserDetails error:', error)
    return null
  }
}
