import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  /* =========================
     LOAD USER ON APP START
  ========================= */
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')

    if (savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUser(JSON.parse(savedUser))
    }

    setLoadingUser(false)
  }, [])

  /* =========================
     LOGIN
  ========================= */
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || []

    const matchedUser = users.find(
      u => u.email === email && u.password === password
    )

    if (!matchedUser) return null

    const loggedInUser = {
      ...matchedUser,
      is_active: matchedUser.is_active ?? true,
      role: matchedUser.role || 'user',
    }

    localStorage.setItem('currentUser', JSON.stringify(loggedInUser))
    setCurrentUser(loggedInUser)

    return loggedInUser
  }

  /* =========================
     UPDATE USER
  ========================= */
  const updateCurrentUser = (user) => {
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  /* =========================
     REFRESH USER
  ========================= */
  const refreshCurrentUser = () => {
    const users = JSON.parse(localStorage.getItem('users')) || []
    const savedUser = JSON.parse(localStorage.getItem('currentUser'))

    if (!savedUser) return

    const latest = users.find(u => u.email === savedUser.email)

    if (latest) {
      setCurrentUser(latest)
      localStorage.setItem('currentUser', JSON.stringify(latest))
    }
  }

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
export const useAuth = () => useContext(AuthContext)