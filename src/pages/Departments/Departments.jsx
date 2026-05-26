import { useEffect, useState } from 'react'
import { fetchEmployees } from '../../services/employeeService'
import './Departments.css'

const Departments = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const data = await fetchEmployees()

        console.log('API DATA:', data) // DEBUG IMPORTANT

        if (!Array.isArray(data)) {
          throw new Error('Invalid API response')
        }

        setEmployees(data)
        setError('')
      } catch (err) {
        console.error(err)
        setError('Failed to load departments')
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // LOADING
  if (loading) {
    return (
      <div className="status-container">
        <h2>Loading Departments...</h2>
      </div>
    )
  }

  // ERROR
  if (error) {
    return (
      <div className="status-container">
        <h2>{error}</h2>
      </div>
    )
  }

  // SAFE GROUPING (CRASH PROOF)
  const departmentMap = {}

  employees.forEach(emp => {
    const dept = emp?.department || 'Unknown'

    if (!departmentMap[dept]) {
      departmentMap[dept] = 0
    }

    departmentMap[dept]++
  })

  const departments = Object.keys(departmentMap).map(key => ({
    name: key,
    count: departmentMap[key],
  }))

  return (
    <div className="departments-page">

      <div className="departments-header">
        <h1>Departments</h1>
        <p>Organize employees by department.</p>
      </div>

      {departments.length === 0 ? (
        <p>No departments found</p>
      ) : (
        <div className="departments-grid">
          {departments.map((dept, index) => (
            <div className="department-card" key={index}>
              <h3>{dept.name}</h3>
              <p>{dept.count} employees</p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Departments