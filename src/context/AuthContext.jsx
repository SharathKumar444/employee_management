import {

  createContext,

  useContext,

  useState

} from 'react'
 
const AuthContext = createContext()
 
export const AuthProvider = ({ children }) => {
 
  const [currentUser, setCurrentUser] =

    useState(null)
 
  const login = async (email, password) => {
 
    const storedUser = JSON.parse(

      localStorage.getItem('user')

    )
 
    if (

      storedUser &&

      storedUser.email === email &&

      storedUser.password === password

    ) {
 
      setCurrentUser(storedUser)
 
      return storedUser

    }
 
    return null

  }
 
  const logout = () => {
 
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
export const useAuth = () => {
 
  return useContext(AuthContext)

}
 