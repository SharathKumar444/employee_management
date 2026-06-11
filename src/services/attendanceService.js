import { getMembers } from './memberService'

export const ATTENDANCE_REQUESTS_KEY = 'attendanceRequests'
const NOTIFICATION_KEY = 'notifications'
const USER_KEY = 'users'

const getStoredRequests = () =>
  JSON.parse(localStorage.getItem(ATTENDANCE_REQUESTS_KEY)) || []

const saveStoredRequests = requests =>
  localStorage.setItem(
    ATTENDANCE_REQUESTS_KEY,
    JSON.stringify(requests)
  )

const getStoredUsers = () =>
  JSON.parse(localStorage.getItem(USER_KEY)) || []

const getStoredNotifications = () =>
  JSON.parse(localStorage.getItem(NOTIFICATION_KEY)) || []

const saveStoredNotifications = notifications =>
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))

const buildAttendanceNotification = (
  admin,
  request
) => ({
  id: Date.now() + Math.random(),
  recipient_user_id: admin.id,
  recipient_email: admin.email,
  type: 'attendance-request',
  requestId: request.id,
  userName: request.userName,
  userEmail: request.userEmail,
  companyId: request.companyId,
  message: `Attendance access requested by ${request.userName} (${request.userEmail}) on ${new Date(request.createdAt).toLocaleString()}`,
  status: request.status,
  is_read: false,
  created_at: new Date().toISOString(),
})

const buildUserNotification = (
  request,
  status,
  admin,
  recipientUserId = null
) => ({
  id: Date.now() + Math.random(),
  recipient_user_id: recipientUserId,
  recipient_email: request.userEmail,
  type: 'attendance-update',
  requestId: request.id,
  message: `Your attendance request has been ${status} by ${admin?.name || admin?.email || 'admin'} on ${new Date().toLocaleString()}`,
  status,
  is_read: false,
  created_at: new Date().toISOString(),
})

export const getAttendanceRequest = currentUser => {
  if (!currentUser?.email || (!currentUser?.companyId && !currentUser?.company_id)) {
    return null
  }

  const companyId =
    currentUser.companyId || currentUser.company_id

  const requests = getStoredRequests()

  return (
    requests.find(
      request =>
        request.userEmail === currentUser.email &&
        request.companyId === companyId &&
        request.status === 'pending'
    ) || null
  )
}

export const createAttendanceRequest = async currentUser => {
  if (!currentUser?.email || (!currentUser?.companyId && !currentUser?.company_id)) {
    return null
  }

  const companyId =
    currentUser.companyId || currentUser.company_id

  const requests = getStoredRequests()

  const existing = requests.find(
    request =>
      request.userEmail === currentUser.email &&
      request.companyId === companyId &&
      request.status === 'pending'
  )

  if (existing) {
    return existing
  }

  const attendanceRequest = {
    id: Date.now(),
    userEmail: currentUser.email,
    userName: currentUser.name || currentUser.email,
    companyId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  requests.push(attendanceRequest)
  saveStoredRequests(requests)

  let admins = []
  try {
    const membersResponse = await getMembers(companyId)
    if (membersResponse?.success && Array.isArray(membersResponse.members)) {
      admins = membersResponse.members.filter(
        member => member.role === 'admin'
      )
    }
  } catch (error) {
    console.error('Failed to fetch company admins for attendance request', error)
  }

  if (admins.length > 0) {
    const notifications = getStoredNotifications()

    admins.forEach(admin => {
      notifications.push(
        buildAttendanceNotification(admin, attendanceRequest)
      )
    })

    saveStoredNotifications(notifications)
    window.dispatchEvent(
      new Event('notification-update')
    )
  }

  return attendanceRequest
}

const updateUserAttendanceAccess = (
  userEmail,
  granted
) => {
  const users = getStoredUsers()
  const updatedUsers = users.map(user => {
    if (user.email === userEmail) {
      return {
        ...user,
        attendance_access: granted,
        attendanceAccess: granted,
      }
    }
    return user
  })

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(updatedUsers)
  )
}

const getMemberByEmail = async (
  companyId,
  email
) => {
  try {
    const membersResponse = await getMembers(companyId)
    if (membersResponse?.success && Array.isArray(membersResponse.members)) {
      return membersResponse.members.find(
        member => member.email === email
      )
    }
  } catch (error) {
    console.error('Failed to resolve user by email', error)
  }
  return null
}

export const approveAttendanceRequest = async (
  requestId,
  adminUser
) => {
  const requests = getStoredRequests()
  const request = requests.find(
    req => req.id === requestId
  )
  if (!request || request.status !== 'pending') {
    return null
  }

  const updatedRequest = {
    ...request,
    status: 'approved',
    resolvedBy: adminUser?.email || adminUser?.name,
    resolvedAt: new Date().toISOString(),
  }

  const updatedRequests = requests.map(req =>
    req.id === requestId
      ? updatedRequest
      : req
  )

  saveStoredRequests(updatedRequests)
  updateUserAttendanceAccess(request.userEmail, true)

  // Update currentUser in localStorage for immediate UI access
  const currentUserStr = localStorage.getItem('currentUser')
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr)
    if (currentUser.email === request.userEmail) {
      currentUser.attendance_access = true
      currentUser.attendanceAccess = true
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }

  const recipientUser = await getMemberByEmail(
    request.companyId,
    request.userEmail
  )
  const recipientUserId = recipientUser?.id || null

  const notifications = getStoredNotifications()
  const updatedNotifications = notifications.map(n => {
    if (
      n.type === 'attendance-request' &&
      n.requestId === requestId
    ) {
      return {
        ...n,
        status: 'approved',
        is_read: true,
        message: `Attendance request from ${request.userName} (${request.userEmail}) has been approved by ${adminUser.email}`,
      }
    }
    return n
  })

  updatedNotifications.push(
    buildUserNotification(
      updatedRequest,
      'approved',
      adminUser,
      recipientUserId
    )
  )

  saveStoredNotifications(updatedNotifications)
  window.dispatchEvent(
    new Event('notification-update')
  )
  window.dispatchEvent(
    new Event('attendance-access-updated')
  )

  return updatedRequest
}

export const rejectAttendanceRequest = async (
  requestId,
  adminUser
) => {
  const requests = getStoredRequests()
  const request = requests.find(
    req => req.id === requestId
  )
  if (!request || request.status !== 'pending') {
    return null
  }

  const updatedRequest = {
    ...request,
    status: 'rejected',
    resolvedBy: adminUser?.email || adminUser?.name,
    resolvedAt: new Date().toISOString(),
  }

  const updatedRequests = requests.map(req =>
    req.id === requestId
      ? updatedRequest
      : req
  )

  saveStoredRequests(updatedRequests)

  const recipientUser = await getMemberByEmail(
    request.companyId,
    request.userEmail
  )
  const recipientUserId = recipientUser?.id || null

  const notifications = getStoredNotifications()
  const updatedNotifications = notifications.map(n => {
    if (
      n.type === 'attendance-request' &&
      n.requestId === requestId
    ) {
      return {
        ...n,
        status: 'rejected',
        is_read: true,
        message: `Attendance request from ${request.userName} (${request.userEmail}) has been rejected by ${adminUser.email}`,
      }
    }
    return n
  })

  updatedNotifications.push(
    buildUserNotification(
      updatedRequest,
      'rejected',
      adminUser,
      recipientUserId
    )
  )

  saveStoredNotifications(updatedNotifications)
  window.dispatchEvent(
    new Event('notification-update')
  )

  return updatedRequest
}

/* =========================
   BACKEND API CALLS
========================= */

const API_URL = 'http://127.0.0.1:8000'

export const checkIn = async (userId, userEmail, companyId) => {
  try {
    const response = await fetch(`${API_URL}/attendance/check-in?user_id=${userId}&user_email=${encodeURIComponent(userEmail)}&company_id=${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    return await response.json()
  } catch (error) {
    console.error('Check-in error:', error)
    return { success: false, message: 'Failed to check in' }
  }
}

export const checkOut = async (userId, userEmail, companyId) => {
  try {
    const response = await fetch(`${API_URL}/attendance/check-out?user_id=${userId}&user_email=${encodeURIComponent(userEmail)}&company_id=${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    return await response.json()
  } catch (error) {
    console.error('Check-out error:', error)
    return { success: false, message: 'Failed to check out' }
  }
}

export const submitLeaveRequest = async (
  userId,
  userEmail,
  companyId,
  leaveType,
  startDate,
  endDate,
  reason
) => {
  try {
    const response = await fetch(`${API_URL}/leaves/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        user_email: userEmail,
        company_id: companyId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      }),
    })
    return await response.json()
  } catch (error) {
    console.error('Leave request error:', error)
    return { success: false, message: 'Failed to submit leave request' }
  }
}

// Backend approve/reject for server-side notifications
export const approveAttendanceRequestBackend = async (userId, adminEmail, companyId) => {
  try {
    const url = `${API_URL}/attendance-access/approve?user_id=${userId}&admin_email=${encodeURIComponent(adminEmail)}&company_id=${encodeURIComponent(companyId)}`
    const response = await fetch(url, { method: 'PUT' })
    return await response.json()
  } catch (error) {
    console.error('approveAttendanceRequestBackend error:', error)
    return { success: false, message: 'Failed to approve attendance request' }
  }
}

export const rejectAttendanceRequestBackend = async (userId, adminEmail, companyId, reason = null) => {
  try {
    const url = `${API_URL}/attendance-access/reject?user_id=${userId}&admin_email=${encodeURIComponent(adminEmail)}&company_id=${encodeURIComponent(companyId)}${reason ? `&rejection_reason=${encodeURIComponent(reason)}` : ''}`
    const response = await fetch(url, { method: 'PUT' })
    return await response.json()
  } catch (error) {
    console.error('rejectAttendanceRequestBackend error:', error)
    return { success: false, message: 'Failed to reject attendance request' }
  }
}
