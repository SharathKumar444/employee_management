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

// =========================
// DEACTIVATION FUNCTIONS
// =========================
export const deactivateMember = async (
  memberId,
  admin_email,
  company_id,
  reason = null
) => {
  try {
    const params = {
      admin_email,
      company_id,
    }

    if (reason) {
      params.reason = reason
    }

    const response = await axios.put(
      `${API_URL}/members/${memberId}/deactivate`,
      null,
      {
        params,
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

// =========================
// SUSPENSION FUNCTIONS
// =========================
export const fetchMembers = async (company_id) => {
  try {
    const response = await axios.get(
      `${API_URL}/suspension/members`,
      {
        params: { company_id },
        timeout: 8000,
      }
    )
    return response.data
  } catch (error) {
    console.error('fetchMembers error:', error)
    throw error
  }
}

export const suspendUser = async (
  user_id,
  admin_email,
  reason = null
) => {
  try {
    const params = {
      admin_email,
    }

    const response = await axios.post(
      `${API_URL}/suspension/suspend/${user_id}`,
      reason,
      { params, timeout: 8000 }
    )

    return response.data
  } catch (error) {
    console.error('suspendUser error:', error)
    throw error
  }
}

export const unsuspendUser = async (user_id, admin_email) => {
  try {
    const response = await axios.post(
      `${API_URL}/suspension/unsuspend/${user_id}`,
      null,
      {
        params: { admin_email },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('unsuspendUser error:', error)
    throw error
  }
}

export const submitReinstallmentRequest = async (
  user_id,
  company_id,
  reason
) => {
  try {
    const response = await axios.post(
      `${API_URL}/suspension/reinstatement-request`,
      { user_id, company_id, reason },
      { timeout: 8000 }
    )

    return response.data
  } catch (error) {
    console.error('submitReinstallmentRequest error:', error)
    throw error
  }
}

export const fetchReinstallmentRequests = async (company_id) => {
  try {
    const response = await axios.get(
      `${API_URL}/suspension/reinstatement-requests`,
      {
        params: { company_id },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('fetchReinstallmentRequests error:', error)
    throw error
  }
}

export const approveReinstallment = async (
  request_id,
  admin_email,
  comment
) => {
  try {
    const response = await axios.put(
      `${API_URL}/suspension/reinstatement-requests/${request_id}/approve`,
      comment,
      {
        params: { admin_email },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('approveReinstallment error:', error)
    throw error
  }
}

export const rejectReinstallment = async (
  request_id,
  admin_email,
  comment
) => {
  try {
    const response = await axios.put(
      `${API_URL}/suspension/reinstatement-requests/${request_id}/reject`,
      comment,
      {
        params: { admin_email },
        timeout: 8000,
      }
    )

    return response.data
  } catch (error) {
    console.error('rejectReinstallment error:', error)
    throw error
  }
}

// Default export
const memberService = {
  getMembers,
  deactivateMember,
  reactivateMember,
  fetchMembers,
  suspendUser,
  unsuspendUser,
  submitReinstallmentRequest,
  fetchReinstallmentRequests,
  approveReinstallment,
  rejectReinstallment,
}

export default memberService
