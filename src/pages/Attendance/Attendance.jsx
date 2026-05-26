import { useEffect, useState } from 'react'
import './Attendance.css'

const Attendance = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dummy data (replace with API later)
    const data = [
      {
        name: 'Chelsey Dietrich',
        department: 'Keebler LLC',
        date: '2026-05-21',
        status: 'On Leave',
      },
      {
        name: 'Clementina DuBuque',
        department: 'Hoeger LLC',
        date: '2026-05-21',
        status: 'Active',
      },
      {
        name: 'Ervin Howell',
        department: 'Deckow-Crist',
        date: '2026-05-21',
        status: 'Active',
      },
      {
        name: 'Glenna Reichert',
        department: 'Yost and Sons',
        date: '2026-05-21',
        status: 'On Leave',
      },
      {
        name: 'Kurtis Weissnat',
        department: 'Johns Group',
        date: '2026-05-21',
        status: 'Active',
      },
      {
        name: 'Leanne Graham',
        department: 'Romaguera-Crona',
        date: '2026-05-21',
        status: 'Active',
      },
      {
        name: 'Mrs. Dennis Schulist',
        department: 'Considine-Lockman',
        date: '2026-05-21',
        status: 'Inactive',
      },
    ]

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttendance(data)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="status-container">
        <h2>Loading Attendance...</h2>
      </div>
    )
  }

  return (
    <div className="attendance-page">

      {/* HEADER */}
      <div className="attendance-header">
        <h1>Attendance</h1>
        <p>Track daily attendance records by employee.</p>
      </div>

      {/* TABLE */}
      <div className="attendance-card">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.department}</td>
                <td>{item.date}</td>
                <td>
                  <span className={`status ${item.status.toLowerCase().replace(' ', '-')}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Attendance