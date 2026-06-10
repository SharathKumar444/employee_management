import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getMembers,
  deactivateMember,
  reactivateMember,
} from '../../services/memberService'

import './Members.css'

const Members = () => {
  const { currentUser } = useAuth()
  const companyId =
    currentUser?.companyId ||
    currentUser?.company_id

  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const loadMembers = async () => {
    if (!companyId) {
      setMembers([])
      return
    }

    try {
      setLoading(true)
      const response = await getMembers(companyId)
      const membersData =
        Array.isArray(response)
          ? response
          : response?.members ||
            response?.data?.members ||
            response?.data ||
            []

      setMembers(membersData)
    } catch (error) {
      console.error('Load members error:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (companyId) {
      loadMembers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const handleDeactivate = async memberId => {
    try {
      await deactivateMember(
        memberId,
        currentUser?.email,
        companyId
      )
      await loadMembers()
    } catch (error) {
      console.error('Deactivate member error:', error)
      alert('Unable to deactivate member')
    }
  }

  const handleReactivate = async memberId => {
    try {
      await reactivateMember(
        memberId,
        currentUser?.email,
        companyId
      )
      await loadMembers()
    } catch (error) {
      console.error('Reactivate member error:', error)
      alert('Unable to reactivate member')
    }
  }

  const filteredMembers = members.filter(member => {
    const term = search.toLowerCase()
    return (
      member?.name?.toLowerCase().includes(term) ||
      member?.email?.toLowerCase().includes(term)
    )
  })

  const activeMembers = filteredMembers.filter(
    member => member.is_active !== false
  )

  const inactiveMembers = filteredMembers.filter(
    member => member.is_active === false
  )

  if (!currentUser) {
    return <h2>Loading user...</h2>
  }

  return (
    <div className="members-page">
      <h1>Company Members</h1>
      <p className="page-subtitle">
        Manage all users for {currentUser?.companyName || currentUser?.company || 'your company'}.
      </p>

      <div className="members-header">
        <input
          className="search-box"
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <p>Loading members...</p>}

      <section className="members-block">
        <h2>Active Members</h2>

        {activeMembers.length === 0 ? (
          <p>No active members found.</p>
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
              {activeMembers.map(member => (
                <tr key={member.id || member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.role || 'User'}</td>
                  <td className="status active">Active</td>
                  <td>
                    <button
                      className="danger-btn"
                      onClick={() => handleDeactivate(member.id)}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="members-block">
        <h2>Inactive Members</h2>

        {inactiveMembers.length === 0 ? (
          <p>No inactive members found.</p>
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
              {inactiveMembers.map(member => (
                <tr key={member.id || member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.role || 'User'}</td>
                  <td className="status inactive">Inactive</td>
                  <td>
                    <button
                      onClick={() => handleReactivate(member.id)}
                    >
                      Reactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default Members
