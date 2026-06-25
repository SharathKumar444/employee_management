import { useState, useEffect } from 'react'
import './EmployeeForm.css'

const EmployeeForm = ({
  onSubmit,
  initialData,
  onClose,
}) => {
  const [formData, setFormData] =
    useState({
      name: '',
      email: '',
      role: '',
      department: '',
      designation: '',
      phone: '',
      address: '',
      date_of_joining: '',
      employee_id: '',
      profile_picture: '',
      status: 'Active',
    })

  const [errors, setErrors] = useState({})

  /* =========================
     LOAD EDIT DATA
  ========================= */
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || '',
        department:
          initialData.department ||
          '',
        designation:
          initialData.designation ||
          '',
        phone:
          initialData.phone ||
          initialData.phone_number ||
          '',
        address:
          initialData.address ||
          '',
        date_of_joining:
          initialData.date_of_joining ||
          initialData.dateOfJoining ||
          initialData.joining_date ||
          '',
        employee_id:
          initialData.employee_id ||
          initialData.employeeId ||
          '',
        profile_picture:
          initialData.profile_picture ||
          initialData.profilePicture ||
          '',
        status:
          initialData.status ||
          'Active',
      })
    }
  }, [initialData])

  /* =========================
     VALIDATION FUNCTION
  ========================= */
  const validate = (name, value) => {
    if (!value || !value.trim()) {
      return 'This field is required'
    }

    if (name === 'email') {
      const emailRegex =
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

      if (!emailRegex.test(value)) {
        return 'Invalid email format'
      }
    }

    return ''
  }

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    setErrors(prev => ({
      ...prev,
      [name]: validate(name, value),
    }))
  }

  /* =========================
     FORM VALIDATION CHECK
  ========================= */
  const isValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.role.trim() &&
    formData.department.trim() &&
    Object.values(errors).every(
      err => err === ''
    )

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = e => {
    e.preventDefault()

    const newErrors = {
      name: validate(
        'name',
        formData.name
      ),
      email: validate(
        'email',
        formData.email
      ),
      role: validate(
        'role',
        formData.role
      ),
      department: validate(
        'department',
        formData.department
      ),
    }

    setErrors(newErrors)

    const hasError = Object.values(
      newErrors
    ).some(err => err)

    if (hasError) return

    onSubmit(formData)
  }

  return (
    <div className="employee-form-modal">
      <form
        className="employee-form"
        onSubmit={handleSubmit}
      >
        <h2>
          {initialData
            ? 'Edit Employee'
            : 'Add Employee'}
        </h2>

        {/* NAME */}
        <label>
          Name <span className="req">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && (
          <p className="error">
            {errors.name}
          </p>
        )}

        {/* EMAIL */}
        <label>
          Email{' '}
          <span className="req">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <p className="error">
            {errors.email}
          </p>
        )}

        {/* ROLE */}
        <label>
          Role <span className="req">*</span>
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="">
            Select Role
          </option>
          <option value="Admin">
            Admin
          </option>
          <option value="User">
            User
          </option>
        </select>
        {errors.role && (
          <p className="error">
            {errors.role}
          </p>
        )}

        {/* DEPARTMENT */}
        <label>
          Department{' '}
          <span className="req">*</span>
        </label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
        />
        {errors.department && (
          <p className="error">
            {errors.department}
          </p>
        )}

        {/* DESIGNATION */}
        <label>Designation</label>
        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
        />

        {/* PHONE */}
        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        {/* ADDRESS */}
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        {/* DATE OF JOINING */}
        <label>Date of Joining</label>
        <input
          type="date"
          name="date_of_joining"
          value={formData.date_of_joining}
          onChange={handleChange}
        />

        {/* EMPLOYEE ID */}
        <label>Employee ID</label>
        <input
          type="text"
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
        />

        {/* PROFILE PICTURE URL */}
        <label>Profile Picture URL</label>
        <input
          type="text"
          name="profile_picture"
          value={formData.profile_picture}
          onChange={handleChange}
        />

        {/* STATUS */}
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Active">
            Active
          </option>
          <option value="On Leave">
            On Leave
          </option>
          <option value="Inactive">
            Inactive
          </option>
        </select>

        {/* BUTTONS */}
        <div className="form-buttons">
          <button
            type="submit"
            disabled={!isValid}
            className="save-btn"
          >
            {initialData
              ? 'Update'
              : 'Add Employee'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm