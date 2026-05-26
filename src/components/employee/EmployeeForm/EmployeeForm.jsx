/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import "./EmployeeForm.css";

const EmployeeForm = ({
  onSubmit,
  initialData,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    designation: "",
    email: "",
    status: "Active"
  });

  // ✅ FIX: Load data properly when editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        department: "",
        designation: "",
        email: "",
        status: "Active"
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // ✅ better validation
    if (
      !formData.name.trim() ||
      !formData.department.trim() ||
      !formData.designation.trim() ||
      !formData.email.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="employee-form-modal">
      <form className="employee-form" onSubmit={handleSubmit}>
        <h2>Employee Form</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
        />

        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* ✅ FIXED SELECT */}
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <div className="form-buttons">
          <button type="submit">Save</button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;