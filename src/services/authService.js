import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export const loginUser = async (email, password) => {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    { email, password }
  )

  return response.data
}

export const logoutUser = async (user_id) => {
  const response = await axios.post(
    `${API_URL}/auth/logout`,
    { user_id }
  )

  return response.data
}