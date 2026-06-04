import './Companies.css'

const Companies = () => {
  const currentUser =
    JSON.parse(
      localStorage.getItem('currentUser')
    ) ||
    JSON.parse(
      localStorage.getItem('user')
    ) ||
    {}

  const companies = [
    {
      companyName: 'Company A',
      companyId: 'COMP001',
      employees: 25,
      users: 5,
    },
    {
      companyName: 'Company B',
      companyId: 'COMP002',
      employees: 18,
      users: 3,
    },
    {
      companyName: 'Company C',
      companyId: 'COMP003',
      employees: 12,
      users: 2,
    },
  ]

  // SAFE COMPANY ID
  const userCompanyId =
    currentUser?.companyId ||
    'COMP001'

  const currentCompany =
    companies.find(
      company =>
        company.companyId ===
        userCompanyId
    ) || companies[0]

  return (
    <div className="companies-page">

      {/* HEADER */}
      <div className="companies-header">
        <h1>Companies</h1>

        <p>
          Multi-Tenant Company
          Management
        </p>
      </div>

      {/* CURRENT COMPANY */}
      <div className="current-company-card">
        <h2>Current Company</h2>

        <h3>
          {currentCompany.companyName}
        </h3>

        <p>
          Company ID:
          {' '}
          {currentCompany.companyId}
        </p>

        <span className="active-badge">
          Active
        </span>
      </div>

      {/* DEBUG */}
      <div
        style={{
          marginBottom: '15px',
          color: '#666',
          fontSize: '14px',
        }}
      >
        Logged Company ID:
        {' '}
        <strong>
          {userCompanyId}
        </strong>
      </div>

      {/* TABLE */}
      <div className="companies-table-card">
        <table className="companies-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Company ID</th>
              <th>Employees</th>
              <th>Users</th>
              <th>Your Access</th>
            </tr>
          </thead>

          <tbody>
            {companies.map(company => (
              <tr key={company.companyId}>
                <td>
                  {company.companyName}
                </td>

                <td>
                  {company.companyId}
                </td>

                <td>
                  {company.employees}
                </td>

                <td>
                  {company.users}
                </td>

                <td>
                  {company.companyId ===
                  userCompanyId ? (
                    <span className="current-company-badge">
                      Current Company
                    </span>
                  ) : (
                    <span className="isolated-company-badge">
                      Isolated Tenant
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Companies