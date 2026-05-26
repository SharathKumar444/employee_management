import './Navbar.css'
import { useAuth } from '../../../context/AuthContext'

const Navbar = () => {
  const { currentUser } = useAuth()

  return (
    <div className="navbar">

      <h3>Employee Management System</h3>

      <div className="navbar-right">
        <span>{currentUser?.email}</span>
      </div>

    </div>
  )
}

export default Navbar