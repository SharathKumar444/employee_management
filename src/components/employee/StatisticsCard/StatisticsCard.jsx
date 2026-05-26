import './StatisticsCard.css'

const StatisticsCard = ({
  title,
  value,
  icon,
}) => {
  return (
    <div className="statistics-card">
      <div className="statistics-top">
        <div>
          <p>{title}</p>

          <h2>{value}</h2>
        </div>

        <div className="statistics-icon">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatisticsCard