import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import { loginUser } from '../services/authService'

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

  return {
    ...user,
    role: user.role || user.role_name || 'user',
    companyId,
    company_id: companyId,
    is_active: isActive,
    isActive,
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
    }

    setLoadingUser(false)
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

  /* =========================
     REFRESH USER DATA
  ========================= */

  const refreshCurrentUser = () => {
    const users =
      JSON.parse(
        localStorage.getItem(
          'users'
        )
      ) || []

    const savedUser =
      JSON.parse(
        localStorage.getItem(
          'currentUser'
        )
      )

    if (!savedUser) {
      return
    }

    const latestUser =
      users.find(
        user =>
          user.email === savedUser.email
      )

    if (latestUser) {
      const normalized = normalizeUser(latestUser)
      setCurrentUser(normalized)
      localStorage.setItem(
        'currentUser',
        JSON.stringify(normalized)
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
