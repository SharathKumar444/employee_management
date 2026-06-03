import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

const AuthContext = createContext()

export const AuthProvider = ({
  children,
}) => {
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null)

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
      setCurrentUser(savedUser)
    }
  }, [])

  /* =========================
     LOGIN
  ========================= */

  const login = async (
    email,
    password
  ) => {
    const users =
      JSON.parse(
        localStorage.getItem(
          'users'
        )
      ) || []

    const matchedUser =
      users.find(
        user =>
          user.email === email &&
          user.password === password
      )

    if (!matchedUser) {
      return null
    }

    const loggedInUser = {
      ...matchedUser,
      role:
        matchedUser.role ||
        'user',
    }

    localStorage.setItem(
      'currentUser',
      JSON.stringify(
        loggedInUser
      )
    )

    setCurrentUser(
      loggedInUser
    )

    return loggedInUser
  }

  /* =========================
     UPDATE CURRENT USER
  ========================= */

  const updateCurrentUser = (
    updatedUser
  ) => {
    setCurrentUser(
      updatedUser
    )

    localStorage.setItem(
      'currentUser',
      JSON.stringify(
        updatedUser
      )
    )
  }

  /* =========================
     REFRESH USER DATA
  ========================= */

  const refreshCurrentUser =
    () => {
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
            user.email ===
            savedUser.email
        )

      if (latestUser) {
        setCurrentUser(
          latestUser
        )

        localStorage.setItem(
          'currentUser',
          JSON.stringify(
            latestUser
          )
        )
      }
    }

  /* =========================
     LOGOUT
  ========================= */

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
