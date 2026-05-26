import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const DepartmentChart = ({ employees }) => {
  const data = Object.values(
    employees.reduce((acc, emp) => {
      acc[emp.department] = acc[emp.department] || {
        department: emp.department,
        count: 0,
      }
      acc[emp.department].count += 1
      return acc
    }, {})
  )

  return (
    <div className="chart-container">
      <h3>Department-wise Employees</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="department" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DepartmentChart