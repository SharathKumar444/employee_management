import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const RoleChart = ({ employees = [] }) => {
  const roleData = Object.values(
    employees.reduce((acc, emp) => {
      const role = emp.designation || 'Unknown'

      if (!acc[role]) {
        acc[role] = {
          name: role,
          value: 0,
        }
      }

      acc[role].value += 1

      return acc
    }, {})
  )

  const COLORS = [
    '#2563eb',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
  ]

  return (
    <div className="chart-card">
      <h3>Employee Count by Role</h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <PieChart>
          <Pie
            data={roleData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
          >
            {roleData.map(
              (entry, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[
                      index %
                        COLORS.length
                    ]
                  }
                />
              )
            )}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RoleChart