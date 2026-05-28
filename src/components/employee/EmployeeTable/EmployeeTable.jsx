import {
  FaEdit,
  FaTrash,
} from 'react-icons/fa'

import './EmployeeTable.css'

const EmployeeTable = ({
  filteredEmployees,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="employee-table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>Department</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="empty-cell"
              >
                No employees found
              </td>
            </tr>
          ) : (
            filteredEmployees.map(employee => (
              <tr key={employee.employee_id}>
                {/* Employee */}
                <td>
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {employee.name?.charAt(0)}
                    </div>

                    <div>
                      <h4>{employee.name}</h4>

                      <p>{employee.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td>
                  <span className="role-badge">
                    {employee.role ||
                      'Employee'}
                  </span>
                </td>

                {/* Department */}
                <td>
                  {employee.department}
                </td>

                {/* Email */}
                <td>{employee.email}</td>

                {/* STATUS DROPDOWN */}
                <td>
                  <select
                    value={
                      employee.status
                    }
                    onChange={e =>
                      onStatusChange(
                        employee,
                        e.target.value
                      )
                    }
                    className={`status-dropdown ${
                      employee.status ===
                      'Active'
                        ? 'active-status'
                        : employee.status ===
                          'Inactive'
                        ? 'inactive-status'
                        : 'leave-status'
                    }`}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                    <option value="On Leave">
                      On Leave
                    </option>
                  </select>
                </td>

                {/* Actions */}
                <td>
                  <div className="action-buttons">
                    {/* EDIT */}
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() =>
                        onEdit(employee)
                      }
                    >
                      <FaEdit />
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        onDelete(
                          employee.employee_id
                        )
                      }
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default EmployeeTable