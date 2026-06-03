import './Companies.css'
// eslint-disable-next-line no-unused-vars
import employeesData from '../../utils/employeesData'

const Companies = () => {
  const currentUser =
    JSON.parse(
      localStorage.getItem('currentUser')
    ) ||
    JSON.parse(
      localStorage.getItem('user')
    ) ||
    {}

  const userCompanyId =
    currentUser.companyId || 'COMP001'

  const allEmployees =
    JSON.parse(
      localStorage.getItem('employees')
    ) || []

  const allUsers =
    JSON.parse(
      localStorage.getItem('users')
    ) || []

  const companies = [
    {
      companyName: 'Company A',
      companyId: 'COMP001',
    },
    {
      companyName: 'Company B',
      companyId: 'COMP002',
    },
    {
      companyName: 'Company C',
      companyId: 'COMP003',
    },
  ]

  const companiesWithCounts =
    companies.map(company => ({
      ...company,

      employees:
        allEmployees.filter(
          employee =>
            employee.companyId ===
            company.companyId
        ).length,

      users:
        allUsers.filter(
          user =>
            user.companyId ===
            company.companyId
        ).length,
    }))

  const currentCompany =
    companiesWithCounts.find(
      company =>
        company.companyId ===
        userCompanyId
    ) || {
      companyName: 'Company A',
      companyId: 'COMP001',
      employees: 0,
      users: 0,
    }

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
          Company ID:{' '}
          {currentCompany.companyId}
        </p>

        <p>
          Employees:{' '}
          {currentCompany.employees}
        </p>

        <p>
          Users:{' '}
          {currentCompany.users}
        </p>

        <span className="active-badge">
          Active
        </span>
      </div>

      {/* COMPANY TABLE */}

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
            {companiesWithCounts.map(
              company => (
                <tr
                  key={company.companyId}
                >
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
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Companies