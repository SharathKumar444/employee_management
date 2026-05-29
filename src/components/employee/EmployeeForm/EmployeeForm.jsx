/* eslint-disable react-hooks/set-state-in-effect */

import {
  useState,
  useEffect,
} from 'react'

import './EmployeeForm.css'

const EmployeeForm = ({
  onSubmit,
  initialData,
  onClose,
}) => {
  /* =========================
     FORM STATE
  ========================= */

  const [formData, setFormData] =
    useState({
      name: '',
      department: '',
      designation: '',
      email: '',
      role: '',
      status: 'Active',
    })

  const [errors, setErrors] =
    useState({})

  /* =========================
     LOAD EDIT DATA
  ========================= */

  useEffect(() => {
    if (initialData) {
      setFormData({
        name:
          initialData.name || '',
        department:
          initialData.department ||
          '',
        designation:
          initialData.designation ||
          '',
        email:
          initialData.email || '',
        role:
          initialData.role || '',
        status:
          initialData.status ||
          'Active',
      })
    } else {
      setFormData({
        name: '',
        department: '',
        designation: '',
        email: '',
        role: '',
        status: 'Active',
      })
    }
  }, [initialData])

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = event => {
    const { name, value } =
      event.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    setErrors(prev => ({
      ...prev,
      [name]: '',
    }))
  }

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {
    const newErrors = {}

    if (
      !formData.name.trim()
    ) {
      newErrors.name =
        'Name is required'
    }

    if (
      !formData.email.trim()
    ) {
      newErrors.email =
        'Email is required'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        'Enter valid email'
    }

    if (
      !formData.department.trim()
    ) {
      newErrors.department =
        'Department is required'
    }

    if (
      !formData.designation.trim()
    ) {
      newErrors.designation =
        'Designation is required'
    }

    if (
      !formData.role.trim()
    ) {
      newErrors.role =
        'Role is required'
    }

    setErrors(newErrors)

    return (
      Object.keys(newErrors)
        .length === 0
    )
  }

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = event => {
    event.preventDefault()

    const isValid =
      validateForm()

    if (!isValid) {
      return
    }

    onSubmit(formData)
  }

  /* =========================
     CHECK FORM VALID
  ========================= */

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.department.trim() &&
    formData.designation.trim() &&
    formData.role.trim()

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

        <div className="form-group">

          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
          />

          {errors.name && (
            <p className="error-text">
              {errors.name}
            </p>
          )}

        </div>

        {/* EMAIL */}

        <div className="form-group">

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          {errors.email && (
            <p className="error-text">
              {errors.email}
            </p>
          )}

        </div>

        {/* DEPARTMENT */}

        <div className="form-group">

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={
              formData.department
            }
            onChange={handleChange}
          />

          {errors.department && (
            <p className="error-text">
              {
                errors.department
              }
            </p>
          )}

        </div>

        {/* DESIGNATION */}

        <div className="form-group">

          <input
            type="text"
            name="designation"
            placeholder="Designation"
            value={
              formData.designation
            }
            onChange={handleChange}
          />

          {errors.designation && (
            <p className="error-text">
              {
                errors.designation
              }
            </p>
          )}

        </div>

        {/* ROLE */}

        <div className="form-group">

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
            <p className="error-text">
              {errors.role}
            </p>
          )}

        </div>

        {/* STATUS */}

        <div className="form-group">

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
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

        </div>

        {/* BUTTONS */}

        <div className="form-buttons">

          <button
            type="submit"
            className="save-btn"
            disabled={!isFormValid}
          >
            Save Employee
          </button>

          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  )
}

export default EmployeeForm