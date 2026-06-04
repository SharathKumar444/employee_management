import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const StatusChart = ({
  employees = [],
}) => {
  const active =
    employees.filter(
      e => e.status === 'Active'
    ).length

  const inactive =
    employees.filter(
      e => e.status === 'Inactive'
    ).length

  const onLeave =
    employees.filter(
      e => e.status === 'On Leave'
    ).length

  const data = [
    {
      name: 'Active',
      value: active,
    },
    {
      name: 'Inactive',
      value: inactive,
    },
    {
      name: 'On Leave',
      value: onLeave,
    },
  ]

  const COLORS = [
    '#10b981',
    '#ef4444',
    '#f59e0b',
  ]

  return (
    <div className="chart-card">
      <h3>Employee Status Overview</h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
          >
            {data.map(
              (entry, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[index]
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

export default StatusChart