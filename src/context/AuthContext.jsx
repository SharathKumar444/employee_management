import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import { loginUser } from '../services/authService'
import { getNotifications } from '../services/notificationService'

const AuthContext = createContext()

const normalizeUser = user => {
  if (!user) {
    return null
  }

  const companyId =
    user.companyId ||
    user.company_id ||
    user.company?.companyId ||
    user.company?.company_id ||
    undefined

  const isActive =
    user.is_active !== undefined
      ? user.is_active
      : user.isActive !== undefined
        ? user.isActive
        : true

  const attendanceAccess =
    user.attendance_access !== undefined
      ? user.attendance_access
      : user.attendanceAccess !== undefined
        ? user.attendanceAccess
        : false

  return {
    ...user,
    role: user.role || user.role_name || 'user',
    companyId,
    company_id: companyId,
    is_active: isActive,
    isActive,
    attendance_access: attendanceAccess,
    attendanceAccess,
  }
}

export const AuthProvider = ({
  children,
}) => {
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {
    const savedUser =
      JSON.parse(
        localStorage.getItem(
          'currentUser'
        )
      )

    if (savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUser(normalizeUser(savedUser))
      syncCurrentUserAttendanceAccess()
    }

    const handleAttendanceUpdate = () => {
      refreshCurrentUser()
      syncCurrentUserAttendanceAccess()
    }

    const handleNotificationUpdate = () => {
      syncCurrentUserAttendanceAccess()
    }

    window.addEventListener(
      'attendance-access-updated',
      handleAttendanceUpdate
    )
    window.addEventListener(
      'notification-update',
      handleNotificationUpdate
    )
    window.addEventListener(
      'storage',
      handleNotificationUpdate
    )

    setLoadingUser(false)

    return () => {
      window.removeEventListener(
        'attendance-access-updated',
        handleAttendanceUpdate
      )
      window.removeEventListener(
        'notification-update',
        handleNotificationUpdate
      )
      window.removeEventListener(
        'storage',
        handleNotificationUpdate
      )
    }
  }, [])

  /* =========================
     LOGIN
  ========================= */

  const login = async (
    email,
    password
  ) => {
    try {
      console.log('AuthContext.login() called with:', { email, password })
      
      const response = await loginUser(
        email,
        password
      )

      console.log('loginUser response:', response)

      if (!response?.success || !response?.data?.user) {
        console.error('Login failed: invalid response structure', { response })
        return null
      }

      const loggedInUser = normalizeUser(
        response.data.user
      )

      console.log('Normalized user:', loggedInUser)

      localStorage.setItem(
        'currentUser',
        JSON.stringify(loggedInUser)
      )

      setCurrentUser(loggedInUser)
      return loggedInUser
    } catch (error) {
      console.error('Auth login error:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
        status: error?.response?.status,
        fullError: error
      })
      return null
    }
  }

  /* =========================
     UPDATE CURRENT USER
  ========================= */

  const updateCurrentUser = (
    updatedUser
  ) => {
    const normalized = normalizeUser(updatedUser)

    setCurrentUser(normalized)
    localStorage.setItem(
      'currentUser',
      JSON.stringify(normalized)
    )
  }
  const syncCurrentUserAttendanceAccess = async () => {
    const savedUser = JSON.parse(
      localStorage.getItem('currentUser')
    )

    if (!savedUser || !savedUser.id || !savedUser.email) {
      return
    }

    const currentAccess =
      savedUser.attendance_access !== undefined
        ? savedUser.attendance_access
        : savedUser.attendanceAccess !== undefined
          ? savedUser.attendanceAccess
          : false

    if (currentAccess) {
      return
    }

    try {
      const response = await getNotifications(
        savedUser.id,
        savedUser.email
      )

      if (!response?.success || !Array.isArray(response.data)) {
        return
      }

      const approvedNotification = response.data.some(
        note =>
          note.type === 'attendance_access_approved' ||
          (note.type === 'attendance-update' && note.status === 'approved')
      )

      if (approvedNotification) {
        const updatedUser = {
          ...savedUser,
          attendance_access: true,
          attendanceAccess: true,
        }

        const normalized = normalizeUser(updatedUser)
        setCurrentUser(normalized)
        localStorage.setItem(
          'currentUser',
          JSON.stringify(normalized)
        )
      }
    } catch (error) {
      console.error(
        'Failed to sync attendance access from notifications:',
        error
      )
    }
  }
  /* =========================
     REFRESH USER DATA
  ========================= */

  function refreshCurrentUser() {
    const savedUser =
      JSON.parse(
        localStorage.getItem(
          'currentUser'
        )
      )

    if (!savedUser) {
      return
    }

    // First check if current user updated in localStorage
    const normalized = normalizeUser(savedUser)
    setCurrentUser(normalized)
    localStorage.setItem(
      'currentUser',
      JSON.stringify(normalized)
    )

    // Also check users array for updates
    const users =
      JSON.parse(
        localStorage.getItem(
          'users'
        )
      ) || []

    const latestUser =
      users.find(
        user =>
          user.email === savedUser.email
      )

    if (latestUser) {
      const normalizedLatest = normalizeUser(latestUser)
      setCurrentUser(normalizedLatest)
      localStorage.setItem(
        'currentUser',
        JSON.stringify(normalizedLatest)
      )
    }
  }

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('user')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        loadingUser,
        login,
        logout,
        updateCurrentUser,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () =>
  useContext(AuthContext)
