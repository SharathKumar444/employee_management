import './EmployeeStatusBadge.css'

const EmployeeStatusBadge = ({ status }) => {
  return (
    <span
      className={`employee-status ${
        status === 'Active'
          ? 'active-status'
          : status === 'Inactive'
          ? 'inactive-status'
          : 'leave-status'
      }`}
    >
      {status}
    </span>
  )
}

export default EmployeeStatusBadge