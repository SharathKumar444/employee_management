import { useEffect, useState } from 'react'

import {
  FaUsers,
  FaUserCheck,
  FaBuilding,
  FaClipboardCheck,
  FaPlus,
} from 'react-icons/fa'

import StatisticsCard from '../../components/employee/StatisticsCard/StatisticsCard'
import EmployeeFilters from '../../components/employee/EmployeeFilters/EmployeeFilters'
import EmployeeTable from '../../components/employee/EmployeeTable/EmployeeTable'
import EmployeeForm from '../../components/employee/EmployeeForm/EmployeeForm'
import ConfirmModal from '../../components/employee/ConfirmModal/ConfirmModal'

import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../services/employeeService'

import './Employees.css'

const Employees = () => {
  const [employees, setEmployees] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [searchInput, setSearchInput] =
    useState('')

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState('All')

  const [showForm, setShowForm] =
    useState(false)

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState(null)

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false)

  const [
    deleteEmployeeId,
    setDeleteEmployeeId,
  ] = useState(null)

  /* Load Employees */

  const loadEmployees = async () => {
    try {
      setLoading(true)

      const data =
        await fetchEmployees()

      setEmployees(data)

      setError('')
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError(
        'Failed to fetch employee data'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEmployees()
  }, [])

  /* Add Employee */

  const handleAddEmployee =
    async employeeData => {
      try {
        await addEmployee(employeeData)

        await loadEmployees()

        setShowForm(false)

        alert(
          'Employee added successfully'
        )
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert(
          'Failed to add employee'
        )
      }
    }

  /* Edit Employee */

  const handleEditEmployee =
    async employeeData => {
      try {
        await updateEmployee(
          selectedEmployee.id,
          employeeData
        )

        await loadEmployees()

        setSelectedEmployee(null)

        setShowForm(false)

        alert(
          'Employee updated successfully'
        )
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert(
          'Failed to update employee'
        )
      }
    }

  /* Open Delete Modal */

  const handleDeleteClick =
    employeeId => {
      setDeleteEmployeeId(
        employeeId
      )

      setShowDeleteModal(true)
    }

  /* Confirm Delete */

  const confirmDeleteEmployee =
    async () => {
      try {
        await deleteEmployee(
          deleteEmployeeId
        )

        await loadEmployees()

        setShowDeleteModal(false)

        alert(
          'Employee deleted successfully'
        )
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert(
          'Failed to delete employee'
        )
      }
    }

  /* Open Edit Form */

  const handleEditOpen =
    employee => {
      setSelectedEmployee(employee)

      setShowForm(true)
    }

  /* Open Add Form */

  const handleAddOpen = () => {
    setSelectedEmployee(null)

    setShowForm(true)
  }

  /* Filter Employees */

  const filteredEmployees =
    employees.filter(employee => {
      const matchesSearch =
        employee.name
          .toLowerCase()
          .includes(
            searchInput.toLowerCase()
          )

      const matchesDepartment =
        departmentFilter ===
          'All' ||
        employee.department ===
          departmentFilter

      return (
        matchesSearch &&
        matchesDepartment
      )
    })

  /* Loading State */

  if (loading) {
    return (
      <div className="status-container">
        <h2>
          Loading employees...
        </h2>
      </div>
    )
  }

  /* Error State */

  if (error) {
    return (
      <div className="status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  return (
    <div className="employees-page">
      {/* Header */}

      <div className="employees-header">
        <div>
          <h1>
            Employees Dashboard
          </h1>

          <p>
            Manage employee records
            and workforce
          </p>
        </div>

        <button
          className="add-employee-btn"
          onClick={handleAddOpen}
        >
          <FaPlus />

          Add Employee
        </button>
      </div>

      {/* Statistics */}

      <div className="statistics-grid">
        <StatisticsCard
          title="Total Employees"
          value={employees.length}
          icon={<FaUsers />}
        />

        <StatisticsCard
          title="Active Employees"
          value={
            employees.filter(
              employee =>
                employee.status ===
                'Active'
            ).length
          }
          icon={<FaUserCheck />}
        />

        <StatisticsCard
          title="Departments"
          value={
            [
              ...new Set(
                employees.map(
                  employee =>
                    employee.department
                )
              ),
            ].length
          }
          icon={<FaBuilding />}
        />

        <StatisticsCard
          title="Attendance"
          value="92%"
          icon={
            <FaClipboardCheck />
          }
        />
      </div>

      {/* Filters */}

      <EmployeeFilters
        searchInput={
          searchInput
        }
        setSearchInput={
          setSearchInput
        }
        departmentFilter={
          departmentFilter
        }
        setDepartmentFilter={
          setDepartmentFilter
        }
      />

      {/* Employee Table */}

      <EmployeeTable
        filteredEmployees={
          filteredEmployees
        }
        onEdit={handleEditOpen}
        onDelete={
          handleDeleteClick
        }
      />

      {/* Empty State */}

      {filteredEmployees.length ===
        0 && (
        <div className="status-container">
          <h2>
            No employees found
          </h2>
        </div>
      )}

      {/* Employee Form Modal */}

      {showForm && (
        <EmployeeForm
          initialData={
            selectedEmployee
          }
          onSubmit={
            selectedEmployee
              ? handleEditEmployee
              : handleAddEmployee
          }
          onClose={() =>
            setShowForm(false)
          }
        />
      )}

      {/* Delete Confirmation Modal */}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Employee"
          message="Are you sure you want to delete this employee?"
          onConfirm={
            confirmDeleteEmployee
          }
          onCancel={() =>
            setShowDeleteModal(false)
          }
        />
      )}
    </div>
  )
}

export default Employees