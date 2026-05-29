import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

const AuthContext =
  createContext()

export const AuthProvider = ({
  children,
}) => {
  const [currentUser, setCurrentUser] =
    useState(null)

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    const savedUser =
      JSON.parse(
        localStorage.getItem(
          'currentUser'
        )
      )

    if (savedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUser(savedUser)
    }
  }, [])

  // =========================
  // LOGIN
  // =========================

  const login = async (
    email,
    password
  ) => {
    // GET REGISTERED USERS
    const users =
      JSON.parse(
        localStorage.getItem(
          'users'
        )
      ) || []

    // FIND MATCHING USER
    const matchedUser = users.find(
      user =>
        user.email === email &&
        user.password === password
    )

    // USER NOT FOUND
    if (!matchedUser) {
      return null
    }

    // SAVE LOGGED IN USER
    localStorage.setItem(
      'currentUser',
      JSON.stringify(matchedUser)
    )

    setCurrentUser(matchedUser)

    return matchedUser
  }

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem(
      'currentUser'
    )

    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () =>
  useContext(AuthContext)