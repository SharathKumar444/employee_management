import { useState } from 'react'

import './DeactivatedAccount.css'

const DeactivatedAccount = () => {
  const currentUser =
    JSON.parse(
      localStorage.getItem('currentUser')
    ) ||
    JSON.parse(
      localStorage.getItem('user')
    ) ||
    {}

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [status, setStatus] =
    useState('Deactivated')

  const submitRequest = async () => {
    try {
      setLoading(true)

      const requestData = {
        user_id: currentUser.id,
        user_name:
          currentUser.name,
        email:
          currentUser.email,
        company_id:
          currentUser.companyId,
        status: 'Pending',
      }

      // Save locally as backup

      const existingRequests =
        JSON.parse(
          localStorage.getItem(
            'reactivationRequests'
          )
        ) || []

      const alreadyExists =
        existingRequests.find(
          request =>
            request.email ===
              currentUser.email &&
            request.status ===
              'Pending'
        )

      if (alreadyExists) {
        setMessage(
          'Reactivation request already submitted.'
        )
        return
      }

      const response =
        await fetch(
          'http://127.0.0.1:8000/reactivation/request',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              requestData
            ),
          }
        )

      if (!response.ok) {
        throw new Error(
          'Request failed'
        )
      }

      localStorage.setItem(
        'reactivationRequests',
        JSON.stringify([
          ...existingRequests,
          {
            id: Date.now(),
            ...requestData,
            requestedAt:
              new Date().toLocaleString(),
          },
        ])
      )

      setStatus('Pending')

      setMessage(
        'Reactivation request submitted successfully.'
      )
    } catch (error) {
      console.error(error)

      setMessage(
        'Unable to submit request. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="deactivated-page">
      <div className="deactivated-card">

        <h1>
          Account Deactivated
        </h1>

        <p>
          Your administrator has
          deactivated your account.
        </p>

        <div className="account-info">

          <p>
            <strong>
              Name:
            </strong>{' '}
            {currentUser.name}
          </p>

          <p>
            <strong>
              Email:
            </strong>{' '}
            {currentUser.email}
          </p>

          <p>
            <strong>
              Status:
            </strong>{' '}
            <span className="status-badge">
              {status}
            </span>
          </p>

        </div>

        <button
          className="request-btn"
          onClick={
            submitRequest
          }
          disabled={
            loading ||
            status === 'Pending'
          }
        >
          {loading
            ? 'Submitting...'
            : status ===
              'Pending'
            ? 'Request Pending'
            : 'Request Reactivation'}
        </button>

        {message && (
          <div className="message-box">
            {message}
          </div>
        )}

      </div>
    </div>
  )
}

export default DeactivatedAccount