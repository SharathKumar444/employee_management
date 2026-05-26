import axios from 'axios'

const API_URL =
  'http://127.0.0.1:8000'

export const fetchEmployees =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/employees`
      )

    return response.data.data
  }

export const addEmployee =
  async employeeData => {
    const response =
      await axios.post(
        `${API_URL}/employees`,
        employeeData
      )

    return response.data
  }

export const updateEmployee =
  async (
    employeeId,
    employeeData
  ) => {
    const response =
      await axios.put(
        `${API_URL}/employees/${employeeId}`,
        employeeData
      )

    return response.data
  }

export const deleteEmployee =
  async employeeId => {
    const response =
      await axios.delete(
        `${API_URL}/employees/${employeeId}`
      )

    return response.data
  }