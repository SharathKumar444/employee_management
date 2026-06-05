import axios from 'axios'

const API =
  'http://127.0.0.1:8000'

export const createInvitation =
  async data => {
    const response =
      await axios.post(
        `${API}/invitations`,
        data
      )

    return response.data
  }

export const fetchInvitations =
  async () => {
    const response =
      await axios.get(
        `${API}/invitations`
      )

    return response.data
  }

export const revokeInvitation =
  async id => {
    const response =
      await axios.delete(
        `${API}/invitations/${id}`
      )

    return response.data
  }