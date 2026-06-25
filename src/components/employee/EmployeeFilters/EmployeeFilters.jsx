import { FaSearch } from 'react-icons/fa'

import './EmployeeFilters.css'

const EmployeeFilters = ({
  searchInput,
  setSearchInput,
  departmentFilter,
  setDepartmentFilter,
  completionFilter,
  setCompletionFilter,
}) => {
  return (
    <div className="employee-filters">
      <div className="search-container">
        <FaSearch />

        <input
          type="text"
          placeholder="Search employee..."
          value={searchInput}
          onChange={event =>
            setSearchInput(event.target.value)
          }
        />
      </div>

      <select
        value={departmentFilter}
        onChange={event =>
          setDepartmentFilter(event.target.value)
        }
      >
        <option value="All">
          All Departments
        </option>

        <option value="Engineering">
          Engineering
        </option>

        <option value="HR">HR</option>

        <option value="Finance">
          Finance
        </option>
      </select>

      <select
        value={completionFilter}
        onChange={event =>
          setCompletionFilter(event.target.value)
        }
      >
        <option value="All">All Profiles</option>
        <option value="Complete">Complete (100%)</option>
        <option value="Incomplete">Incomplete (&lt;100%)</option>
        <option value="NeedsAttention">Needs Attention (&lt;80%)</option>
      </select>
    </div>
  )
}

export default EmployeeFilters