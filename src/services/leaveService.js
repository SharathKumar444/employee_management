import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const submitLeaveRequest = async (
  userId,
  userEmail,
  companyId,
  leaveType,
  startDate,
  endDate,
  reason = null
) => {
  try {
    const response = await axios.post(`${API_URL}/leaves/request`, {
      user_id: userId,
      user_email: userEmail,
      company_id: companyId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
    }, {
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Leave request error:', error)
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to submit leave request',
    }
  }
}

export const getMyLeaveRequests = async (userId, companyId, status = null) => {
  try {
    const params = { user_id: userId, company_id: companyId }
    if (status) params.status = status

    const response = await axios.get(`${API_URL}/leaves/my-requests`, {
      params,
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Get my leave requests error:', error)
    return {
      success: false,
      data: [],
    }
  }
}

export const getCompanyLeaveRequests = async (companyId, status = null) => {
  try {
    const params = { company_id: companyId }
    if (status) params.status = status

    const response = await axios.get(`${API_URL}/leaves/company-requests`, {
      params,
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Get company leave requests error:', error)
    return {
      success: false,
      data: [],
    }
  }
}

export const approveLeaveRequest = async (
  leaveId,
  adminEmail,
  companyId
) => {
  try {
    const response = await axios.put(
      `${API_URL}/leaves/${leaveId}/approve`,
      null,
      {
        params: {
          admin_email: adminEmail,
          company_id: companyId,
        },
        timeout: 8000,
      }
    )
    return response.data
  } catch (error) {
    console.error('Approve leave error:', error)
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to approve leave request',
    }
  }
}

export const rejectLeaveRequest = async (
  leaveId,
  adminEmail,
  companyId,
  rejectionReason = null
) => {
  try {
    const params = {
      admin_email: adminEmail,
      company_id: companyId,
    }
    if (rejectionReason) params.rejection_reason = rejectionReason

    const response = await axios.put(
      `${API_URL}/leaves/${leaveId}/reject`,
      null,
      { params, timeout: 8000 }
    )
    return response.data
  } catch (error) {
    console.error('Reject leave error:', error)
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to reject leave request',
    }
  }
}
