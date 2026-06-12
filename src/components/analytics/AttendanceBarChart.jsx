import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

const AttendanceChart = ({
  totalEmployees,
  activeEmployees,
}) => {
  const inactiveEmployees =
    totalEmployees - activeEmployees

  const data = [
    {
      name: "Active",
      value: activeEmployees,
    },
    {
      name: "Inactive",
      value: inactiveEmployees,
    },
  ]

  const COLORS = [
    "#22c55e",
    "#ef4444",
  ]

  return (
    <div className="attendance-chart-wrapper">
      <div className="attendance-stats">
        <div className="attendance-stat-card active">
          <h2>{activeEmployees}</h2>
          <p>Active Employees</p>
        </div>

        <div className="attendance-stat-card inactive">
          <h2>{inactiveEmployees}</h2>
          <p>Inactive Employees</p>
        </div>
      </div>

      <ResponsiveContainer
        width="100%"
        height={280}
      >
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
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

export default AttendanceChart