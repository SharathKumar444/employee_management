import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.is_active === false) {
    return <Navigate to="/account-deactivated" replace />
  }

  if (!user.companyId && !user.company_id) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute