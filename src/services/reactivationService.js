import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const createReactivationRequest = async (userId, company_id, reason = null) => {
  const response = await axios.post(
    `${API_URL}/reactivation`,
    {
      user_id: userId,
      company_id,
      reason,
    },
    {
      timeout: 8000,
    }
  )

  return response.data
}

export const getReactivationRequests = async company_id => {
  const response = await axios.get(
    `${API_URL}/reactivation`,
    {
      params: {
        company_id,
      },
      timeout: 8000,
    }
  )

  return response.data
}

export const approveRequest = async (requestId, admin_name, comment = null) => {
  try {
    console.log('API Call - Approve:', { requestId, admin_name, comment })
    const response = await axios.put(
      `${API_URL}/reactivation/${requestId}/approve`,
      comment ? { comment } : {},
      {
        params: {
          admin_name,
        },
        timeout: 8000,
      }
    )
    console.log('API Response - Approve:', response.data)
    return response.data
  } catch (error) {
    console.error('API Error - Approve:', error.response?.data || error.message)
    throw error
  }
}

export const rejectRequest = async (requestId, admin_name, comment = null) => {
  try {
    console.log('API Call - Reject:', { requestId, admin_name, comment })
    const response = await axios.put(
      `${API_URL}/reactivation/${requestId}/reject`,
      comment ? { comment } : {},
      {
        params: {
          admin_name,
        },
        timeout: 8000,
      }
    )
    console.log('API Response - Reject:', response.data)
    return response.data
  } catch (error) {
    console.error('API Error - Reject:', error.response?.data || error.message)
    throw error
  }
}
