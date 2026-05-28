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

  /* =========================
     CLEAR OLD NOTIFICATIONS
  ========================= */

  useEffect(() => {
    localStorage.removeItem(
      'notifications'
    )
  }, [])

  /* =========================
     LOAD EMPLOYEES
  ========================= */

  const loadEmployees = async () => {
    try {
      setLoading(true)

      const data =
        await fetchEmployees()

      if (Array.isArray(data)) {
        setEmployees(data)
      } else {
        setEmployees([])
      }

      setError('')
    } catch (err) {
      console.error(err)

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

  /* =========================
     ADD EMPLOYEE
  ========================= */

  const handleAddEmployee =
    async employeeData => {
      try {
        await addEmployee(
          employeeData
        )

        /* NOTIFICATION */

        const oldNotifications =
          JSON.parse(
            localStorage.getItem(
              'notifications'
            )
          ) || []

        const newNotification = {
          id: Date.now(),
          type: 'add',
          message: `${employeeData.name} was added successfully`,
          time: 'Just now',
        }

        localStorage.setItem(
          'notifications',
          JSON.stringify([
            newNotification,
            ...oldNotifications,
          ])
        )

        window.dispatchEvent(
          new Event(
            'notification-update'
          )
        )

        await loadEmployees()

        setShowForm(false)

        alert(
          'Employee added successfully'
        )
      } catch (err) {
        console.error(err)

        alert(
          'Failed to add employee'
        )
      }
    }

  /* =========================
     EDIT EMPLOYEE
  ========================= */

  const handleEditEmployee =
    async employeeData => {
      try {
        if (
          !selectedEmployee?.employee_id
        ) {
          alert('Employee ID missing')
          return
        }

        await updateEmployee(
          selectedEmployee.employee_id,
          employeeData
        )

        /* NOTIFICATION */

        const oldNotifications =
          JSON.parse(
            localStorage.getItem(
              'notifications'
            )
          ) || []

        const newNotification = {
          id: Date.now(),
          type: 'edit',
          message: `${employeeData.name} profile updated`,
          time: 'Just now',
        }

        localStorage.setItem(
          'notifications',
          JSON.stringify([
            newNotification,
            ...oldNotifications,
          ])
        )

        window.dispatchEvent(
          new Event(
            'notification-update'
          )
        )

        await loadEmployees()

        setSelectedEmployee(null)

        setShowForm(false)

        alert(
          'Employee updated successfully'
        )
      } catch (err) {
        console.error(err)

        alert(
          'Failed to update employee'
        )
      }
    }

  /* =========================
     DELETE EMPLOYEE
  ========================= */

  const handleDeleteClick =
    employeeId => {
      setDeleteEmployeeId(
        employeeId
      )

      setShowDeleteModal(true)
    }

  const confirmDeleteEmployee =
    async () => {
      try {
        if (!deleteEmployeeId) {
          alert('Employee ID missing')
          return
        }

        const employeeToDelete =
          employees.find(
            employee =>
              employee.employee_id ===
                deleteEmployeeId ||
              employee.id ===
                deleteEmployeeId
          )

        await deleteEmployee(
          deleteEmployeeId
        )

        /* NOTIFICATION */

        const oldNotifications =
          JSON.parse(
            localStorage.getItem(
              'notifications'
            )
          ) || []

        const newNotification = {
          id: Date.now(),
          type: 'delete',
          message: `${
            employeeToDelete?.name ||
            'Employee'
          } deleted successfully`,
          time: 'Just now',
        }

        localStorage.setItem(
          'notifications',
          JSON.stringify([
            newNotification,
            ...oldNotifications,
          ])
        )

        window.dispatchEvent(
          new Event(
            'notification-update'
          )
        )

        await loadEmployees()

        setShowDeleteModal(false)

        setDeleteEmployeeId(null)

        alert(
          'Employee deleted successfully'
        )
      } catch (err) {
        console.error(err)

        alert(
          'Failed to delete employee'
        )
      }
    }

  /* =========================
     OPEN EDIT FORM
  ========================= */

  const handleEditOpen =
    employee => {
      setSelectedEmployee(employee)

      setShowForm(true)
    }

  /* =========================
     OPEN ADD FORM
  ========================= */

  const handleAddOpen = () => {
    setSelectedEmployee(null)

    setShowForm(true)
  }

  /* =========================
     STATUS CHANGE
  ========================= */

  const handleStatusChange =
    async (
      employee,
      newStatus
    ) => {
      try {
        /* PREVENT SAME STATUS */
        if (
          employee.status ===
          newStatus
        ) {
          return
        }

        const updatedEmployee = {
          ...employee,
          status: newStatus,
        }

        await updateEmployee(
          employee.employee_id ||
            employee.id,
          updatedEmployee
        )

        /* =========================
           NOTIFICATIONS
        ========================= */

        const oldNotifications =
          JSON.parse(
            localStorage.getItem(
              'notifications'
            )
          ) || []

        let statusMessage = ''

        if (
          newStatus === 'Active'
        ) {
          statusMessage = `${employee.name} is now Active`
        }

        if (
          newStatus === 'Inactive'
        ) {
          statusMessage = `${employee.name} is now Inactive`
        }

        if (
          newStatus === 'On Leave'
        ) {
          statusMessage = `${employee.name} is On Leave`
        }

        const newNotification = {
          id: Date.now(),
          type: 'status',
          message: statusMessage,
          time: 'Just now',
        }

        localStorage.setItem(
          'notifications',
          JSON.stringify([
            newNotification,
            ...oldNotifications,
          ])
        )

        /* LIVE UPDATE NAVBAR */

        window.dispatchEvent(
          new Event(
            'notification-update'
          )
        )

        await loadEmployees()
      } catch (err) {
        console.error(err)

        alert(
          'Failed to update status'
        )
      }
    }

  /* =========================
     FILTER EMPLOYEES
  ========================= */

  const filteredEmployees =
    employees.filter(employee => {
      const matchesSearch =
        employee?.name
          ?.toLowerCase()
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

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="status-container">
        <h2>
          Loading employees...
        </h2>
      </div>
    )
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="employees-page">

      {/* HEADER */}

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

      {/* STATISTICS */}

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

      {/* FILTERS */}

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

      {/* EMPLOYEE TABLE */}

      <EmployeeTable
        filteredEmployees={
          filteredEmployees
        }
        onEdit={handleEditOpen}
        onDelete={
          handleDeleteClick
        }
        onStatusChange={
          handleStatusChange
        }
      />

      {/* EMPTY */}

      {filteredEmployees.length ===
        0 && (
        <div className="status-container">
          <h2>
            No employees found
          </h2>
        </div>
      )}

      {/* EMPLOYEE FORM */}

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
          onClose={() => {
            setShowForm(false)

            setSelectedEmployee(
              null
            )
          }}
        />
      )}

      {/* DELETE MODAL */}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Employee"
          message="Are you sure you want to delete this employee?"
          onConfirm={
            confirmDeleteEmployee
          }
          onCancel={() => {
            setShowDeleteModal(
              false
            )

            setDeleteEmployeeId(
              null
            )
          }}
        />
      )}

    </div>
  )
}

export default Employees