import {
  FaUser,
  FaUserShield,
} from 'react-icons/fa'

import './MemberCard.css'

const MemberCard = ({
  member,
  onDeactivate,
}) => {
  return (
    <div className="member-card">

      <div className="member-header">

        <div className="member-avatar">

          {member.name
            ?.charAt(0)
            ?.toUpperCase()}

        </div>

        <div>

          <h3>{member.name}</h3>

          <p>{member.email}</p>

        </div>

      </div>

      <div className="member-body">

        <div className="member-role">

          {member.role ===
          'Admin' ? (
            <FaUserShield />
          ) : (
            <FaUser />
          )}

          <span>
            {member.role}
          </span>

        </div>

        <span
          className={
            member.status ===
            'Active'
              ? 'badge-active'
              : 'badge-inactive'
          }
        >
          {member.status}
        </span>

      </div>

      {member.status ===
        'Active' && (
        <button
          className="member-action-btn"
          onClick={() =>
            onDeactivate(
              member.id
            )
          }
        >
          Deactivate
        </button>
      )}

    </div>
  )
}

export default MemberCard