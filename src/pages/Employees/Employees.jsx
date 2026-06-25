import { useEffect, useState } from 'react'

import {
  FaUsers,
  FaUserCheck,
  FaBuilding,
  FaClipboardCheck,
  FaExclamationTriangle,
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
import { logLocalAuditEvent } from '../../services/auditService'
import {
  getProfileCompletionScore,
} from '../../utils/profileCompletion'

import './Employees.css'

const currentUser =
  JSON.parse(
    localStorage.getItem('currentUser')
  ) ||
  JSON.parse(
    localStorage.getItem('user')
  ) ||
  {}

 
const userCompanyId =
  currentUser.companyId


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
  const [completionFilter,
    setCompletionFilter,
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

  /* =========================
     LOAD EMPLOYEES
  ========================= */
const loadEmployees = async () => {
  setLoading(true)

  try {
    console.log(
      'Fetching employees...'
    )

    const data =
      await fetchEmployees()

    console.log(
      'Employee API Response:',
      data
    )

    setEmployees(
      Array.isArray(data)
        ? data
        : []
    )

    setError('')
  } catch (err) {
    console.error(
      'Employee Load Error:',
      err
    )

    setError(
      err?.response?.data?.message ||
      'Failed to load employees'
    )
  } finally {
    setLoading(false)
  }
}

/* =========================
   CALL API ON PAGE LOAD
========================= */

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
        await addEmployee({
  ...employeeData,
  company_id: userCompanyId,
})

        const newScore = getProfileCompletionScore(employeeData)

        const oldNotifications =
          JSON.parse(
            localStorage.getItem(
              'notifications'
            )
          ) || []

        const newNotification = {
          id: Date.now(),
          recipient_email: employeeData.email,
          type: 'profile-completion',
          message: `${employeeData.name} profile created with ${newScore}% completion`,
          time: 'Just now',
          is_read: false,
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

        logLocalAuditEvent({
          type: 'profile_created',
          userEmail: employeeData.email,
          userName: employeeData.name,
          action: 'Employee profile created',
          details: `Completion ${newScore}%`,
          performedBy: currentUser.email,
          company_id: userCompanyId,
        })

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
        const employeeId =
          selectedEmployee?._id ||
          selectedEmployee?.employee_id ||
          selectedEmployee?.id

        if (!employeeId) {
          alert('Employee ID missing')
          return
        }

        await updateEmployee(
  employeeId,
  {
    ...employeeData,
    company_id: userCompanyId,
  },
  currentUser.email
)

        const oldNotifications =
          JSON.parse(
            localStorage.getItem(
              'notifications'
            )
          ) || []

        const updatedScore = getProfileCompletionScore(employeeData)
        const notificationMessage =
          updatedScore === 100
            ? `${employeeData.name}'s profile is now complete`
            : `${employeeData.name}'s profile is ${updatedScore}% complete`

        const newNotification = {
          id: Date.now(),
          recipient_email: employeeData.email,
          type: 'profile-completion',
          message: notificationMessage,
          time: 'Just now',
          is_read: false,
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

        logLocalAuditEvent({
          type: 'profile_updated',
          userEmail: employeeData.email,
          userName: employeeData.name,
          action: 'Employee profile updated',
          details: `Completion ${updatedScore}%`,
          performedBy: currentUser.email,
          company_id: userCompanyId,
        })

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
    employee => {
      setSelectedEmployee(employee)

      setShowDeleteModal(true)
    }

  const confirmDeleteEmployee =
    async () => {
      try {
        const employeeId =
          selectedEmployee?._id ||
          selectedEmployee?.employee_id ||
          selectedEmployee?.id

        if (!employeeId) {
          alert('Employee ID missing')
          return
        }

        await deleteEmployee(
          employeeId
        )

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
            selectedEmployee?.name ||
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

        setEmployees(prev =>
          prev.filter(
            employee =>
              (
                employee._id ||
                employee.employee_id ||
                employee.id
              ) !== employeeId
          )
        )

        setShowDeleteModal(false)

        setSelectedEmployee(null)

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
        if (
          employee.status ===
          newStatus
        ) {
          return
        }

        const updatedEmployee = {
  name: employee.name,
  department: employee.department,
  designation: employee.designation,
  email: employee.email,
  status: newStatus,
  company_id:
    employee.companyId ||
    employee.company_id ||
    userCompanyId,
}
        

        const employeeId =
          employee._id ||
          employee.employee_id ||
          employee.id

        await updateEmployee(
          employeeId,
          updatedEmployee,
          currentUser.email
        )

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
          is_read: false,
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
   const filteredEmployees = (employees || [])
  .filter(employee => {
    if (!userCompanyId) return true

    return (
      String(employee.companyId) ===
      String(userCompanyId)
    )
  })
  .filter(employee => {
    const matchesSearch =
      employee?.name
        ?.toLowerCase()
        .includes(searchInput.toLowerCase())

    const matchesDepartment =
      departmentFilter === 'All' ||
      employee.department === departmentFilter

    return (
      matchesSearch &&
      matchesDepartment
    )
  })
  .filter(employee => {
    if (completionFilter === 'All') {
      return true
    }

    const score = getProfileCompletionScore(employee)

    if (completionFilter === 'Complete') {
      return score === 100
    }

    if (completionFilter === 'Incomplete') {
      return score < 100
    }

    if (completionFilter === 'NeedsAttention') {
      return score < 80
    }

    return true
  })

  const averageProfileCompletion =
    filteredEmployees.length > 0
      ? Math.round(
          filteredEmployees
            .map(getProfileCompletionScore)
            .reduce((sum, score) => sum + score, 0) /
          filteredEmployees.length
        )
      : 0

  const incompleteProfileCount =
    filteredEmployees.filter(
      employee =>
        getProfileCompletionScore(employee) <
        100
    ).length

  const needsAttentionCount =
    filteredEmployees.filter(
      employee =>
        getProfileCompletionScore(employee) <
        80
    ).length

  const lowCompletionEmployees = filteredEmployees
    .filter(employee =>
      getProfileCompletionScore(employee) < 80
    )
    .sort(
      (a, b) =>
        getProfileCompletionScore(a) -
        getProfileCompletionScore(b)
    )
    .slice(0, 3)

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
    value={filteredEmployees.length}
    icon={<FaUsers />}
  />

  <StatisticsCard
    title="Active Employees"
    value={
      filteredEmployees.filter(
        employee =>
          employee?.status === 'Active'
      ).length
    }
    icon={<FaUserCheck />}
  />

  <StatisticsCard
    title="Departments"
    value={
      [
        ...new Set(
          filteredEmployees
            .filter(
              employee =>
                employee?.department
            )
            .map(
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
    icon={<FaClipboardCheck />}
  />

  <StatisticsCard
    title="Profile Completion"
    value={`${averageProfileCompletion}%`}
    icon={<FaClipboardCheck />}
  />

  <StatisticsCard
    title="At-Risk Profiles"
    value={needsAttentionCount}
    icon={<FaExclamationTriangle />}
  />

  <StatisticsCard
    title="Incomplete Profiles"
    value={incompleteProfileCount}
    icon={<FaUsers />}
  />

</div>

      {/* THRESHOLD ALERT */}
      {needsAttentionCount > 0 && (
        <div className="threshold-alert">
          <div>
            <h3>Profile Completion Alert</h3>
            <p>
              {needsAttentionCount} employee(s) have less than 80% profile completion.
            </p>
            <p>
              {lowCompletionEmployees.length > 0
                ? `Top low-completion employees: ${lowCompletionEmployees
                    .map(emp => emp.name || emp.email)
                    .join(', ')}`
                : 'Review the employee list to identify additional profile gaps.'}
            </p>
          </div>
          <button
            className="highlight-filter-btn"
            onClick={() =>
              setCompletionFilter('NeedsAttention')
            }
          >
            Filter low completion
          </button>
        </div>
      )}

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
        completionFilter={
          completionFilter
        }
        setCompletionFilter={
          setCompletionFilter
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

            setSelectedEmployee(
              null
            )
          }}
        />
      )}

    </div>
  )
}

export default Employees