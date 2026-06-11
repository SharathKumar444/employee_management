import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

// ==========================================
// ATTENDANCE OPERATIONS
// ==========================================

export const checkIn = async (userId, userEmail, companyId) => {
  try {
    const response = await axios.post(`${API_URL}/attendance/check-in`, null, {
      params: { user_id: userId, user_email: userEmail, company_id: companyId },
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Check-in error:', error)
    return {
      success: false,
      message: error.response?.data?.detail || 'Check-in failed',
    }
  }
}

export const checkOut = async (userId, userEmail, companyId) => {
  try {
    const response = await axios.post(`${API_URL}/attendance/check-out`, null, {
      params: { user_id: userId, user_email: userEmail, company_id: companyId },
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Check-out error:', error)
    return {
      success: false,
      message: error.response?.data?.detail || 'Check-out failed',
    }
  }
}

export const getTodayAttendance = async (userId, companyId) => {
  try {
    const response = await axios.get(`${API_URL}/attendance/today`, {
      params: { user_id: userId, company_id: companyId },
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Get today attendance error:', error)
    return {
      success: false,
      data: {
        status: 'not_started',
        check_in_time: null,
        check_out_time: null,
        working_hours: 0,
      },
    }
  }
}

export const getAttendanceHistory = async (userId, companyId, days = 30) => {
  try {
    const response = await axios.get(`${API_URL}/attendance/history`, {
      params: { user_id: userId, company_id: companyId, days },
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Get attendance history error:', error)
    return {
      success: false,
      data: [],
    }
  }
}

export const getCompanyAttendance = async (companyId, attendanceDate = null) => {
  try {
    const params = { company_id: companyId }
    if (attendanceDate) params.attendance_date = attendanceDate

    const response = await axios.get(`${API_URL}/attendance/company`, {
      params,
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Get company attendance error:', error)
    return {
      success: false,
      data: [],
    }
  }
}

export const getWorkingHoursSummary = async (userId, companyId, days = 30) => {
  try {
    const response = await axios.get(`${API_URL}/attendance/summary`, {
      params: { user_id: userId, company_id: companyId, days },
      timeout: 8000,
    })
    return response.data
  } catch (error) {
    console.error('Get working hours summary error:', error)
    return {
      success: false,
      data: {
        total_hours: 0,
        present_days: 0,
        absent_days: 0,
        average_hours_per_day: 0,
      },
    }
  }
}
