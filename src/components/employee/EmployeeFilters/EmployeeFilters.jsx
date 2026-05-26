import { FaSearch } from 'react-icons/fa'

import './EmployeeFilters.css'

const EmployeeFilters = ({
  searchInput,
  setSearchInput,
  departmentFilter,
  setDepartmentFilter,
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
    </div>
  )
}

export default EmployeeFilters