import { useEffect, useState } from 'react'

import {
  fetchMembers,
  deactivateUser,
} from '../../services/memberService'

import './Members.css'

const Members = () => {
  const [members, setMembers] =
    useState([])

  const loadMembers = async () => {
    try {
      const data =
        await fetchMembers()

      setMembers(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(error)
      setMembers([])
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMembers()
  }, [])

  const handleDeactivate =
    async member => {
      try {
        await deactivateUser(
          member.id
        )

        // Create Reactivation Request

        const existingRequests =
          JSON.parse(
            localStorage.getItem(
              'reactivationRequests'
            )
          ) || []

        const requestExists =
          existingRequests.find(
            request =>
              request.email ===
                member.email &&
              request.status ===
                'Pending'
          )

        if (!requestExists) {
          const newRequest = {
            // eslint-disable-next-line react-hooks/purity
            id: Date.now(),

            name:
              member.name,

            email:
              member.email,

            role:
              member.role,

            status:
              'Pending',

            requestedAt:
              new Date().toLocaleString(),
          }

          localStorage.setItem(
            'reactivationRequests',
            JSON.stringify([
              ...existingRequests,
              newRequest,
            ])
          )
        }

        // Update Members UI

        setMembers(prev =>
          prev.map(item =>
            item.id === member.id
              ? {
                  ...item,
                  status:
                    'Deactivated',
                }
              : item
          )
        )

        alert(
          `${member.name} has been deactivated`
        )
      } catch (error) {
        console.error(error)

        alert(
          'Failed to deactivate member'
        )
      }
    }

  return (
    <div className="members-page">
      <h1>
        Company Members
      </h1>

      {members.length ===
      0 ? (
        <div className="empty-state">
          No Members Found
        </div>
      ) : (
        <table className="members-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {members.map(
              member => (
                <tr
                  key={member.id}
                >
                  <td>
                    {member.name}
                  </td>

                  <td>
                    {member.email}
                  </td>

                  <td>
                    {member.role}
                  </td>

                  <td>
                    <span
                      className={
                        member.status ===
                        'Active'
                          ? 'status-active'
                          : 'status-inactive'
                      }
                    >
                      {
                        member.status
                      }
                    </span>
                  </td>

                  <td>
                    {member.status ===
                    'Active' ? (
                      <button
                        className="deactivate-btn"
                        onClick={() =>
                          handleDeactivate(
                            member
                          )
                        }
                      >
                        Deactivate
                      </button>
                    ) : (
                      <span className="deactivated-text">
                        Deactivated
                      </span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Members