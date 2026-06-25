import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

// =========================
// NORMALIZE EMPLOYEE DATA
// =========================
const normalizeEmployee = employee => ({
  name: employee.name,
  department: employee.department,
  designation: employee.designation,
  email: employee.email,
  phone: employee.phone,
  address: employee.address,
  date_of_joining: employee.date_of_joining,
  profile_picture: employee.profile_picture,
  employee_id: employee.employee_id,
  status: employee.status,
  company_id:
    employee.company_id ||
    employee.companyId ||
    'COMP001',
})

// =========================
// GET EMPLOYEES
// =========================
export const fetchEmployees = async () => {
  try {
    console.log('📡 Fetching employees...')

    const response = await axios.get(
      `${API_URL}/employees`,
      {
        timeout: 8000,
      }
    )

    console.log(
      '✅ Employee API Response:',
      response.data
    )

    if (Array.isArray(response.data)) {
      return response.data
    }

    if (
      response.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error(
      '❌ fetchEmployees error:',
      error
    )

    return []
  }
}

// =========================
// ADD EMPLOYEE
// =========================
export const addEmployee = async (
  employeeData
) => {
  try {
    const payload =
      normalizeEmployee(employeeData)

    console.log(
      '➕ Add Employee Payload:',
      payload
    )

    const response = await axios.post(
      `${API_URL}/employees`,
      payload
    )

    return response.data
  } catch (error) {
    console.error(
      '❌ addEmployee error:',
      error.response?.data || error
    )

    throw error
  }
}

// =========================
// UPDATE EMPLOYEE
// =========================
export const updateEmployee = async (
  employeeId,
  employeeData,
  performedBy
) => {
  try {
    const payload =
      normalizeEmployee(employeeData)

    const query = performedBy
      ? `?performed_by=${encodeURIComponent(performedBy)}`
      : ''

    console.log(
      '✏️ Update Payload:',
      payload
    )

    const response = await axios.put(
      `${API_URL}/employees/${employeeId}${query}`,
      payload
    )

    return response.data
  } catch (error) {
    console.error(
      '❌ updateEmployee error:',
      error.response?.data || error
    )

    throw error
  }
}

// =========================
// DELETE EMPLOYEE
// =========================
export const deleteEmployee = async (
  employeeId
) => {
  try {
    const response = await axios.delete(
      `${API_URL}/employees/${employeeId}`
    )

    return response.data
  } catch (error) {
    console.error(
      '❌ deleteEmployee error:',
      error.response?.data || error
    )

    throw error
  }
}