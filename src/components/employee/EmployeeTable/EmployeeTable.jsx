import {
  FaEdit,
  FaTrash,
  FaSort,
} from 'react-icons/fa'

import EmployeeStatusBadge from '../EmployeeStatusBadge/EmployeeStatusBadge'

import './EmployeeTable.css'

const EmployeeTable = ({
  filteredEmployees,
}) => {
  return (
    <div className="employee-table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th>
              Employee <FaSort />
            </th>

            <th>
              Role <FaSort />
            </th>

            <th>
              Department <FaSort />
            </th>

            <th>
              Email <FaSort />
            </th>

            <th>
              Status <FaSort />
            </th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map(employee => (
            <tr key={employee.id}>
              <td>
                <div className="employee-info">
                  <div className="employee-avatar">
                    {employee.name.charAt(0)}
                  </div>

                  <div>
                    <h4>{employee.name}</h4>

                    <p>{employee.email}</p>
                  </div>
                </div>
              </td>

              <td>{employee.designation}</td>

              <td>{employee.department}</td>

              <td>{employee.email}</td>

              <td>
                <EmployeeStatusBadge
                  status={employee.status}
                />
              </td>

              <td>
                <div className="action-buttons">
                  <button className="edit-btn">
                    <FaEdit />
                  </button>

                  <button className="delete-btn">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EmployeeTable