import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AccountDeactivated.css'

const AccountDeactivated = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true })
      return
    }

    if (currentUser.is_active !== false) {
      navigate('/dashboard', { replace: true })
    }
  }, [currentUser, navigate])

  return (
    <div className="deactivated-page">
      <div className="deactivated-card">
        <h1>Account Disabled</h1>
        <p>
          Your account has been deactivated. If you believe this is a mistake,
          please contact your administrator or request reactivation.
        </p>

        <div className="deactivated-actions">
          <Link to="/login" className="secondary-btn">
            Return to Login
          </Link>
          <Link to="/request-reactivation" className="primary-btn">
            Request Reactivation
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AccountDeactivated
