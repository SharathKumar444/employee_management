import EmployeeStatusBadge from '../EmployeeStatusBadge/EmployeeStatusBadge'

import './EmployeeCard.css'

const EmployeeCard = ({ employee }) => {
  return (
    <div className="employee-card">
      <div className="employee-avatar">
        {employee.name.charAt(0)}
      </div>

      <h3>{employee.name}</h3>

      <p>{employee.designation}</p>

      <span className="employee-department">
        {employee.department}
      </span>

      <EmployeeStatusBadge
        status={employee.status}
      />
    </div>
  )
}

export default EmployeeCard