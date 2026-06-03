import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const AdminRoleRequests = () => {
  // eslint-disable-next-line no-unused-vars
  const { currentUser, updateCurrentUser } =
    useAuth()

  const [requests, setRequests] =
    useState([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadRequests = () => {
    const allRequests =
      JSON.parse(
        localStorage.getItem(
          'roleRequests'
        )
      ) || []

    const filtered =
      allRequests.filter(
        request =>
          request.adminEmail ===
            currentUser?.email &&
          request.status ===
            'pending'
      )

    setRequests(filtered)
  }

  const approveRequest = requestId => {
    const users =
      JSON.parse(
        localStorage.getItem('users')
      ) || []

    const requests =
      JSON.parse(
        localStorage.getItem(
          'roleRequests'
        )
      ) || []

    const request =
      requests.find(
        req => req.id === requestId
      )

    if (!request) return

    const updatedUsers =
      users.map(user => {
        if (
          user.email ===
          request.userEmail
        ) {
          return {
            ...user,
            role: 'admin',
          }
        }

        return user
      })

    const updatedRequests =
      requests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'approved',
          }
        }

        return req
      })

    localStorage.setItem(
      'users',
      JSON.stringify(
        updatedUsers
      )
    )

    localStorage.setItem(
      'roleRequests',
      JSON.stringify(
        updatedRequests
      )
    )

    const notifications =
      JSON.parse(
        localStorage.getItem(
          'notifications'
        )
      ) || []

    notifications.push({
      // eslint-disable-next-line react-hooks/purity
      id: Date.now(),
      email: request.userEmail,
      message:
        'Your Admin role request was approved',
      time:
        new Date().toLocaleString(),
    })

    localStorage.setItem(
      'notifications',
      JSON.stringify(
        notifications
      )
    )

    window.dispatchEvent(
      new Event(
        'notification-update'
      )
    )

    loadRequests()
  }

  const rejectRequest = requestId => {
    const requests =
      JSON.parse(
        localStorage.getItem(
          'roleRequests'
        )
      ) || []

    const updated =
      requests.map(request =>
        request.id === requestId
          ? {
              ...request,
              status: 'rejected',
            }
          : request
      )

    localStorage.setItem(
      'roleRequests',
      JSON.stringify(updated)
    )

    loadRequests()
  }

  return (
    <div className="page-container">
      <h1>
        Admin Role Requests
      </h1>

      {requests.length === 0 ? (
        <p>
          No pending requests
        </p>
      ) : (
        requests.map(request => (
          <div
            key={request.id}
            className="request-card"
          >
            <h3>
              {request.userName}
            </h3>

            <p>
              {request.userEmail}
            </p>

            <button
              onClick={() =>
                approveRequest(
                  request.id
                )
              }
            >
              Approve
            </button>

            <button
              onClick={() =>
                rejectRequest(
                  request.id
                )
              }
            >
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  )
}

export default AdminRoleRequests