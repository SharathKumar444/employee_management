import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const getNotifications = async userId => {
  const response = await axios.get(`${API_URL}/notifications`, {
    params: { user_id: userId },
    timeout: 8000,
  })

  return response.data
}

export const markNotificationRead = async id => {
  const response = await axios.put(`${API_URL}/notifications/${id}/mark_read`, null, {
    timeout: 8000,
  })

  return response.data
}

export const markAllNotificationsRead = async userId => {
  const response = await axios.put(`${API_URL}/notifications/mark_all_read`, null, {
    params: { user_id: userId },
    timeout: 8000,
  })

  return response.data
}
