import { useTheme } from '../../../context/ThemeContext'

import './Navbar.css'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="navbar">
      <h2>Enterprise Employee Management System</h2>

      <button onClick={toggleTheme}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
    </header>
  )
}

export default Navbar