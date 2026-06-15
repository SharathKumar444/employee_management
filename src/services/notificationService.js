import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'
const LOCAL_NOTIFICATION_KEY = 'notifications'

const getLocalNotifications = () =>
  JSON.parse(localStorage.getItem(LOCAL_NOTIFICATION_KEY)) || []

const saveLocalNotifications = notifications =>
  localStorage.setItem(
    LOCAL_NOTIFICATION_KEY,
    JSON.stringify(notifications)
  )

const filterUserLocalNotifications = (
  userId,
  userEmail
) => {
  const normalizedId =
    userId !== undefined && userId !== null
      ? String(userId)
      : null
  const normalizedEmail =
    userEmail || null

  return getLocalNotifications().filter(note => {
    const recipientId =
      note.recipient_user_id !== undefined &&
      note.recipient_user_id !== null
        ? String(note.recipient_user_id)
        : null
    const recipientEmail =
      note.recipient_email || null

    return (
      (normalizedId && recipientId === normalizedId) ||
      (normalizedEmail && recipientEmail === normalizedEmail)
    )
  })
}

export const getNotifications = async (
  userId,
  userEmail
) => {
  const localNotifications =
    filterUserLocalNotifications(
      userId,
      userEmail
    )

  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { user_id: userId },
      timeout: 8000,
    })

    const serverNotifications =
      response.data?.data?.map(n => {
        let parsed = null
        try {
          parsed = n.payload ? JSON.parse(n.payload) : null
        } catch (err) {
          parsed = null
        }

        // Normalize attendance access request notifications
        if (n.type === 'attendance_access_request' && parsed) {
          return {
            id: n.id,
            recipient_user_id: n.recipient_user_id,
            type: 'attendance_access_request',
            message: `Attendance access requested by ${parsed.user_name} (${parsed.user_email})`,
            status: 'pending',
            requestId: parsed.request_id || null,
            requestUserId: parsed.user_id || null,
            requestUserEmail: parsed.user_email || null,
            is_read: n.is_read,
            created_at: n.created_at,
            payload: n.payload,
          }
        }

        // Normalize leave request notifications
        if (n.type === 'leave_request') {
          const leavePayload = parsed || (() => {
            if (!n.payload) return null
            const requestMatch = n.payload.match(/#(\d+)/)
            const emailMatch = n.payload.match(/from\s+([^\s]+)\s*-\s*/)
            return {
              request_id: requestMatch ? requestMatch[1] : null,
              user_email: emailMatch ? emailMatch[1] : null,
            }
          })()

          return {
            id: n.id,
            recipient_user_id: n.recipient_user_id,
            type: 'leave_request',
            message: `Leave request from ${leavePayload?.user_email || 'Unknown user'}`,
            status: 'pending',
            requestId: leavePayload?.request_id || null,
            requestUserId: leavePayload?.user_id || null,
            requestUserEmail: leavePayload?.user_email || null,
            is_read: n.is_read,
            created_at: n.created_at,
            payload: n.payload,
            parsed: leavePayload,
          }
        }

        // Other notifications: attempt to surface structured fields when available
        if (parsed) {
          return {
            id: n.id,
            recipient_user_id: n.recipient_user_id,
            type: n.type,
            message: n.type === 'attendance_access_approved' ? `Your attendance access has been approved` : n.type === 'attendance_access_rejected' ? `Your attendance access request was rejected` : (n.payload || ''),
            status: 'server',
            is_read: n.is_read,
            created_at: n.created_at,
            payload: n.payload,
            parsed,
          }
        }

        return {
          id: n.id,
          recipient_user_id: n.recipient_user_id,
          type: n.type,
          message: n.payload,
          status: 'server',
          is_read: n.is_read,
          created_at: n.created_at,
        }
      }) || []

    const merged = [
      ...serverNotifications,
      ...localNotifications.filter(
        localNote =>
          !serverNotifications.some(
            serverNote => serverNote.id === localNote.id
          )
      ),
    ]

    return {
      success: true,
      data: merged,
    }
  } catch (error) {
    return {
      success: true,
      data: localNotifications,
    }
  }
}

export const markNotificationRead = async id => {
  try {
    await axios.put(`${API_URL}/notifications/${id}/mark_read`, null, {
      timeout: 8000,
    })
  } catch (error) {
    // ignore backend failures for local notifications
  }

  const notifications = getLocalNotifications()
  const updated = notifications.map(note =>
    note.id === id
      ? { ...note, is_read: true }
      : note
  )

  saveLocalNotifications(updated)
  return { success: true, id }
}

export const markAllNotificationsRead = async (
  userId,
  userEmail
) => {
  try {
    await axios.put(`${API_URL}/notifications/mark_all_read`, null, {
      params: { user_id: userId },
      timeout: 8000,
    })
  } catch (error) {
    // ignore backend failures for local notifications
  }

  const notifications = getLocalNotifications()
  const normalizedUserId =
    userId !== undefined && userId !== null
      ? String(userId)
      : null
  const normalizedUserEmail =
    userEmail || null

  const updated = notifications.map(note => {
    const recipientId =
      note.recipient_user_id !== undefined &&
      note.recipient_user_id !== null
        ? String(note.recipient_user_id)
        : null
    const recipientEmail =
      note.recipient_email || null

    return (
      (normalizedUserId && recipientId === normalizedUserId) ||
      (normalizedUserEmail && recipientEmail === normalizedUserEmail)
    )
      ? { ...note, is_read: true }
      : note
  })

  saveLocalNotifications(updated)

  return {
    success: true,
    marked: updated.filter(note => {
      const recipientId =
        note.recipient_user_id !== undefined &&
        note.recipient_user_id !== null
          ? String(note.recipient_user_id)
          : null
      return recipientId === normalizedUserId
    }).length,
  }
}
