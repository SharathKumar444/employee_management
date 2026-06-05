import axios from 'axios'

const API =
  'http://127.0.0.1:8000'

// =======================
// GET ALL MEMBERS
// =======================
export const fetchMembers =
  async () => {
    try {
      const response =
        await axios.get(
          `${API}/members`
        )

      return Array.isArray(
        response.data
      )
        ? response.data
        : []
    } catch (error) {
      console.error(
        'Fetch Members Error:',
        error
      )
      return []
    }
  }

// =======================
// DEACTIVATE USER
// =======================
export const deactivateUser =
  async id => {
    try {
      const response =
        await axios.put(
          `${API}/members/${id}/deactivate`
        )

      return response.data
    } catch (error) {
      console.error(
        'Deactivate User Error:',
        error
      )
      throw error
    }
  }

// =======================
// ACTIVATE USER
// =======================
export const activateUser =
  async id => {
    try {
      const response =
        await axios.put(
          `${API}/members/${id}/activate`
        )

      return response.data
    } catch (error) {
      console.error(
        'Activate User Error:',
        error
      )
      throw error
    }
  }

// =======================
// DELETE MEMBER
// =======================
export const deleteMember =
  async id => {
    try {
      const response =
        await axios.delete(
          `${API}/members/${id}`
        )

      return response.data
    } catch (error) {
      console.error(
        'Delete Member Error:',
        error
      )
      throw error
    }
  }