import './MemberTable.css'

const MemberTable = ({
  members,
  onDeactivate,
}) => {
  return (
    <div className="member-table-container">
      <table className="member-table">

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

          {members.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="empty-cell"
              >
                No Members Found
              </td>
            </tr>
          ) : (
            members.map(member => (
              <tr key={member.id}>

                <td>{member.name}</td>

                <td>{member.email}</td>

                <td>{member.role}</td>

                <td>
                  <span
                    className={
                      member.status ===
                      'Active'
                        ? 'status-active'
                        : 'status-inactive'
                    }
                  >
                    {member.status}
                  </span>
                </td>

                <td>
                  {member.status ===
                  'Active' ? (
                    <button
                      className="deactivate-btn"
                      onClick={() =>
                        onDeactivate(
                          member.id
                        )
                      }
                    >
                      Deactivate
                    </button>
                  ) : (
                    <span>
                      Disabled
                    </span>
                  )}
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>
    </div>
  )
}

export default MemberTable