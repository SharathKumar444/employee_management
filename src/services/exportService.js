/**
 * Export Service - Frontend API calls for data export
 */

import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for larger file generation
})

// Get current user info from context or localStorage
const getCurrentUserInfo = () => {
  const userJSON = localStorage.getItem('currentUser')
  if (!userJSON) return null

  try {
    const user = JSON.parse(userJSON)
    return {
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId || user.company_id,
    }
  } catch (e) {
    console.error('Error parsing user info:', e)
    return null
  }
}

// Get available export types
export const fetchAvailableExportTypes = async () => {
  try {
    const userInfo = getCurrentUserInfo()
    if (!userInfo) {
      return { success: false, error: 'User information not found' }
    }

    const response = await api.get('/export/available-types', {
      params: {
        user_id: userInfo.userId,
        user_email: userInfo.userEmail,
        company_id: userInfo.companyId,
      },
    })

    if (response.data.success) {
      return {
        success: true,
        types: response.data.types || [],
        typeNames: response.data.type_names || {},
        formats: response.data.formats || [],
      }
    }
    return { success: false, error: 'Failed to fetch export types' }
  } catch (error) {
    console.error('Error fetching export types:', error.message)
    return { success: false, error: error.message }
  }
}

// Export data in specified format
export const exportData = async (
  dataType,
  format,
  startDate = null,
  endDate = null
) => {
  try {
    const userInfo = getCurrentUserInfo()
    if (!userInfo) {
      return { success: false, error: 'User information not found' }
    }

    const params = {
      user_id: userInfo.userId,
      user_email: userInfo.userEmail,
      company_id: userInfo.companyId,
    }

    if (startDate) {
      params.start_date = startDate
    }

    if (endDate) {
      params.end_date = endDate
    }

    const response = await api.post(
      `/export/data/${dataType}/${format}`,
      null,
      {
        params,
        responseType: 'blob',
      }
    )

    // Get filename from response header
    const contentDisposition = response.headers['content-disposition']
    let filename = `${dataType}_export.${format}`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=([^;]+)/)
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/"/g, '')
      }
    }

    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)

    return {
      success: true,
      message: `${dataType} exported successfully as ${filename}`,
      filename,
    }
  } catch (error) {
    console.error(`Error exporting ${dataType}:`, error.message)
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    }
  }
}

// Get export history
export const fetchExportHistory = async (limit = 100) => {
  try {
    const userInfo = getCurrentUserInfo()
    if (!userInfo) {
      return { success: false, error: 'User information not found' }
    }

    const response = await api.get('/export/history', {
      params: {
        user_id: userInfo.userId,
        user_email: userInfo.userEmail,
        company_id: userInfo.companyId,
        limit,
      },
    })

    if (response.data.success) {
      return {
        success: true,
        history: response.data.data || [],
        count: response.data.count || 0,
      }
    }
    return { success: false, error: 'Failed to fetch export history' }
  } catch (error) {
    console.error('Error fetching export history:', error.message)
    return { success: false, error: error.message }
  }
}

// Format export reason - sanitize and limit length
export const formatExportReason = (reason) => {
  if (!reason) return null
  return reason.trim().substring(0, 500)
}

// Get MIME type for download
export const getMimeType = (format) => {
  const types = {
    csv: 'text/csv',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
  }
  return types[format] || 'application/octet-stream'
}
