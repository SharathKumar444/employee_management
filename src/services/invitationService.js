import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const getInvitations = async companyId => {
  try {
    const response = await axios.get(
      `${API_URL}/invitations`,
      {
        params: {
          company_id: companyId,
        },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('getInvitations error:', error)
    return []
  }
}

export const validateInvite = async token => {
  try {
    const response = await axios.get(
      `${API_URL}/invitations/validate`,
      {
        params: { token },
        timeout: 8000,
      }
    )
    return response.data
  } catch (error) {
    console.error('validateInvite error:', error)
    return { success: false, message: 'Failed to validate invitation' }
  }
}

export const createInvitation = async (
  email,
  role,
  admin_email,
  company_id,
  expires_days
) => {
  const payload = {
    email,
    role,
    admin_email,
    company_id,
  }

  if (expires_days) {
    payload.expires_days = expires_days
  }

  const response = await axios.post(
    `${API_URL}/invitations`,
    payload,
    {
      timeout: 8000,
    }
  )

  return response.data
}

export const signupWithInvite = async (
  name,
  email,
  password,
  role,
  company_id,
  invite_token
) => {
  const payload = {
    name,
    email,
    password,
    role,
    company_id,
  }

  if (invite_token) {
    payload.invite_token = invite_token
  }

  const response = await axios.post(
    `${API_URL}/signup`,
    payload,
    { timeout: 8000 }
  )

  return response.data
}

export const revokeInvitation = async (
  inviteId,
  admin_email,
  company_id
) => {
  const response = await axios.put(
    `${API_URL}/invitations/${inviteId}/revoke`,
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
}
