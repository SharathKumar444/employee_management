import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

/**
 * GET all employees
 */
export const fetchEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/employees`)

    // SAFE fallback (VERY IMPORTANT)
    return response.data?.data || response.data || []
  } catch (error) {
    console.error('fetchEmployees error:', error)
    return []
  }
}

/**
 * ADD employee
 */
export const addEmployee = async (employeeData) => {
  try {
    const response = await axios.post(
      `${API_URL}/employees`,
      employeeData
    )

    return response.data
  } catch (error) {
    console.error('addEmployee error:', error)
    throw error
  }
}

/**
 * UPDATE employee
 */
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await axios.put(
      `${API_URL}/employees/${employeeId}`,
      employeeData
    )

    return response.data
  } catch (error) {
    console.error('updateEmployee error:', error)
    throw error
  }
}

/**
 * DELETE employee
 */
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/employees/${employeeId}`
    )

    return response.data
  } catch (error) {
    console.error('deleteEmployee error:', error)
    throw error
  }
}