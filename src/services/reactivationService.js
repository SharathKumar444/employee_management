import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const createReactivationRequest = async (
  userId,
  company_id
) => {
  const response = await axios.post(
    `${API_URL}/reactivation`,
    {
      user_id: userId,
      company_id,
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

export const approveRequest = async (requestId, admin_email) => {
  const response = await axios.put(
    `${API_URL}/reactivation/${requestId}/approve`,
    null,
    {
      params: {
        admin_email,
      },
      timeout: 8000,
    }
  )

  return response.data
}

export const rejectRequest = async (requestId, admin_email) => {
  const response = await axios.put(
    `${API_URL}/reactivation/${requestId}/reject`,
    null,
    {
      params: {
        admin_email,
      },
      timeout: 8000,
    }
  )

  return response.data
}
