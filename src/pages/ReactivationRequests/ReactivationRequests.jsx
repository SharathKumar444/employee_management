import { useEffect, useState } from 'react'
import './ReactivationRequests.css'

const ReactivationRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // =========================
  // LOAD FROM LOCALSTORAGE
  // =========================
  const loadRequests = () => {
    try {
      const stored =
        JSON.parse(
          localStorage.getItem(
            'reactivationRequests'
          )
        ) || []

      setRequests(stored)
    } catch (err) {
      console.error(err)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRequests()

    window.addEventListener(
      'storage',
      loadRequests
    )

    return () => {
      window.removeEventListener(
        'storage',
        loadRequests
      )
    }
  }, [])

  // =========================
  // APPROVE REQUEST
  // =========================
  const approve = id => {
    const updated = requests.map(r =>
      r.id === id
        ? { ...r, status: 'Approved' }
        : r
    )

    localStorage.setItem(
      'reactivationRequests',
      JSON.stringify(updated)
    )

    // update members also
    const members =
      JSON.parse(
        localStorage.getItem('members')
      ) || []

    const req = updated.find(
      r => r.id === id
    )

    const updatedMembers = members.map(
      m =>
        m.email === req.email
          ? {
              ...m,
              status: 'Active',
            }
          : m
    )

    localStorage.setItem(
      'members',
      JSON.stringify(updatedMembers)
    )

    setRequests(updated)
  }

  // =========================
  // REJECT REQUEST
  // =========================
  const reject = id => {
    const updated = requests.map(r =>
      r.id === id
        ? { ...r, status: 'Rejected' }
        : r
    )

    localStorage.setItem(
      'reactivationRequests',
      JSON.stringify(updated)
    )

    setRequests(updated)
  }

  // =========================
  // LOADING UI
  // =========================
  if (loading) {
    return (
      <div className="empty-state">
        Loading Requests...
      </div>
    )
  }

  return (
    <div className="reactivation-page">

      {/* HEADER */}
      <div className="reactivation-header">
        <h2>
          Reactivation Requests
        </h2>

        <p>
          Manage user account reactivation workflow
        </p>
      </div>

      {/* EMPTY STATE */}
      {requests.length === 0 ? (
        <div className="empty-state">
          No Reactivation Requests Found
        </div>
      ) : (
        <div className="table-card">

          <table className="request-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map(req => (
                <tr key={req.id}>

                  <td>{req.name}</td>
                  <td>{req.email}</td>

                  <td>
                    <span
                      className={`status ${req.status?.toLowerCase()}`}
                    >
                      {req.status}
                    </span>
                  </td>

                  <td>
                    {req.requestedAt}
                  </td>

                  <td>
                    {req.status ===
                      'Pending' && (
                      <div className="action-group">

                        <button
                          className="approve-btn"
                          onClick={() =>
                            approve(req.id)
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() =>
                            reject(req.id)
                          }
                        >
                          Reject
                        </button>

                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  )
}

export default ReactivationRequests