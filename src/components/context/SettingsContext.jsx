import { createContext, useContext, useEffect, useState } from 'react'

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  // load saved settings
  useEffect(() => {
    const savedDark = JSON.parse(localStorage.getItem('darkMode'))
    const savedNotify = JSON.parse(localStorage.getItem('notifications'))

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedDark !== null) setDarkMode(savedDark)
    if (savedNotify !== null) setNotifications(savedNotify)
  }, [])

  // persist
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [darkMode, notifications])

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext)