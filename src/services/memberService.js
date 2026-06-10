import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const getMembers = async companyId => {
  try {
    const response = await axios.get(
      `${API_URL}/members`,
      {
        params: {
          company_id: companyId,
        },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('getMembers error:', error)
    return []
  }
}

export const deactivateMember = async (
  memberId,
  admin_email,
  company_id
) => {
  try {
    const response = await axios.put(
      `${API_URL}/members/${memberId}/deactivate`,
      null,
      {
        params: {
          admin_email,
          company_id,
        },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('deactivateMember error:', error)
    throw error
  }
}

export const reactivateMember = async (
  memberId,
  admin_email,
  company_id
) => {
  try {
    const response = await axios.put(
      `${API_URL}/members/${memberId}/reactivate`,
      null,
      {
        params: {
          admin_email,
          company_id,
        },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('reactivateMember error:', error)
    throw error
  }
}
