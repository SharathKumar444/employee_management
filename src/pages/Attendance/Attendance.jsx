import {
  useEffect,
  useState,
} from 'react'

import {
  FaDownload,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
} from 'react-icons/fa'

import { useAuth } from '../../context/AuthContext'

import './Attendance.css'

const Attendance = () => {
  const { currentUser } =
    useAuth()

  const [
    attendance,
    setAttendance,
  ] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [
    searchInput,
    setSearchInput,
  ] = useState('')

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    const data = [
      {
        id: 1,
        name:
          'Chelsey Dietrich',
        department:
          'Keebler LLC',
        date: '2026-05-21',
        status: 'On Leave',
      },
      {
        id: 2,
        name:
          'Clementina DuBuque',
        department:
          'Hoeger LLC',
        date: '2026-05-21',
        status: 'Active',
      },
      {
        id: 3,
        name:
          'Ervin Howell',
        department:
          'Deckow-Crist',
        date: '2026-05-21',
        status: 'Active',
      },
      {
        id: 4,
        name:
          'Glenna Reichert',
        department:
          'Yost and Sons',
        date: '2026-05-21',
        status: 'On Leave',
      },
      {
        id: 5,
        name:
          'Kurtis Weissnat',
        department:
          'Johns Group',
        date: '2026-05-21',
        status: 'Active',
      },
      {
        id: 6,
        name:
          'Leanne Graham',
        department:
          'Romaguera-Crona',
        date: '2026-05-21',
        status: 'Inactive',
      },
    ]

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttendance(data)

    setLoading(false)
  }, [])

  /* =========================
     FILTER
  ========================= */

  const filteredAttendance =
    attendance.filter(item =>
      item.name
        .toLowerCase()
        .includes(
          searchInput.toLowerCase()
        )
    )

  /* =========================
     DOWNLOAD CSV
  ========================= */

  const downloadCSV = () => {
    const headers = [
      'Employee',
      'Department',
      'Date',
      'Status',
    ]

    const rows =
      filteredAttendance.map(
        item => [
          item.name,
          item.department,
          item.date,
          item.status,
        ]
      )

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.join(',')
      ),
    ].join('\n')

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv',
      }
    )

    const url =
      window.URL.createObjectURL(
        blob
      )

    const link =
      document.createElement('a')

    link.href = url

    link.setAttribute(
      'download',
      'attendance-report.csv'
    )

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="status-container">
        <h2>
          Loading Attendance...
        </h2>
      </div>
    )
  }

  return (
    <div className="attendance-page">

      {/* HEADER */}

      <div className="attendance-header">

        <div>

          <h1>
            Attendance Dashboard
          </h1>

          <p>
            Track employee
            attendance records
          </p>

        </div>

        {/* ADMIN ONLY DOWNLOAD */}

        {currentUser?.role ===
          'admin' && (
          <button
            className="download-btn"
            onClick={downloadCSV}
          >
            <FaDownload />
            Download Report
          </button>
        )}

      </div>

      {/* STATS */}

      <div className="attendance-stats">

        <div className="attendance-stat-card">

          <FaUserCheck className="attendance-icon active-icon" />

          <div>
            <h3>
              {
                attendance.filter(
                  item =>
                    item.status ===
                    'Active'
                ).length
              }
            </h3>

            <p>
              Present Employees
            </p>
          </div>

        </div>

        <div className="attendance-stat-card">

          <FaUserClock className="attendance-icon leave-icon" />

          <div>
            <h3>
              {
                attendance.filter(
                  item =>
                    item.status ===
                    'On Leave'
                ).length
              }
            </h3>

            <p>
              On Leave
            </p>
          </div>

        </div>

        <div className="attendance-stat-card">

          <FaUserTimes className="attendance-icon inactive-icon" />

          <div>
            <h3>
              {
                attendance.filter(
                  item =>
                    item.status ===
                    'Inactive'
                ).length
              }
            </h3>

            <p>
              Inactive Employees
            </p>
          </div>

        </div>

      </div>

      {/* SEARCH */}

      <div className="attendance-search">

        <input
          type="text"
          placeholder="Search employee..."
          value={searchInput}
          onChange={e =>
            setSearchInput(
              e.target.value
            )
          }
        />

      </div>

      {/* TABLE */}

      <div className="attendance-card">

        <table className="attendance-table">

          <thead>

            <tr>
              <th>
                Employee
              </th>

              <th>
                Department
              </th>

              <th>Date</th>

              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {filteredAttendance.map(
              item => (
                <tr key={item.id}>

                  <td>
                    {item.name}
                  </td>

                  <td>
                    {
                      item.department
                    }
                  </td>

                  <td>
                    {item.date}
                  </td>

                  <td>

                    <span
                      className={`status ${item.status
                        .toLowerCase()
                        .replace(
                          ' ',
                          '-'
                        )}`}
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Attendance