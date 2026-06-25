import {
  FaEdit,
  FaTrash,
} from 'react-icons/fa'
import {
  getProfileCompletionScore,
} from '../../../utils/profileCompletion'

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
            <th>Completion</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {filteredEmployees.length ===
          0 ? (
            <tr>
              <td
                colSpan="7"
                className="empty-cell"
              >
                No employees found
              </td>
            </tr>
          ) : (
            filteredEmployees.map(
              employee => (
                <tr
                  key={
                    employee.id
                  }
                >

                  {/* EMPLOYEE */}

                  <td>
                    <div className="employee-info">

                      <div className="employee-avatar">
                        {employee.name
                          ?.charAt(
                            0
                          )
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <h4>
                          {
                            employee.name
                          }
                        </h4>

                        <p>
                          {
                            employee.email
                          }
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* ROLE */}

                  <td>
                    <span className="role-badge">
                      {employee.role ||
                        'Employee'}
                    </span>
                  </td>

                  {/* DEPARTMENT */}

                  <td>
                    {
                      employee.department
                    }
                  </td>

                  {/* EMAIL */}

                  <td>
                    {
                      employee.email
                    }
                  </td>

                  {/* COMPLETION */}
                  <td>
                    {(() => {
                      const score = getProfileCompletionScore(employee)
                      const statusClass =
                        score === 100
                          ? 'complete'
                          : score >= 80
                          ? 'partial'
                          : 'attention'

                      return (
                        <span className={`completion-pill ${statusClass}`}>
                          {score}%
                        </span>
                      )
                    })()}
                  </td>

                  {/* STATUS */}

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

                  {/* ACTIONS */}

                  <td>

                    <div className="action-buttons">

                      {/* EDIT */}

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          onEdit(
                            employee
                          )
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
                            employee
                          )
                        }
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>
              )
            )
          )}

        </tbody>

      </table>

    </div>
  )
}

export default EmployeeTable