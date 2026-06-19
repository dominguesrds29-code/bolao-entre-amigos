export function Leaderboard({ data }) {
  return (
    <section className="leaderboard-section">
      <h3 className="section-title">Ranking da Galera</h3>
      <div className="leaderboard-card">
        {data.map((user) => (
          <div key={user.pos} className={`leaderboard-item ${user.pos <= 3 ? 'top-3' : ''}`}>
            <div className="user-rank">
              <span className="rank-num">{user.pos}º</span>
              <div className="avatar-small"></div>
              <span className="user-name">{user.name}</span>
            </div>
            <div className="user-score">
              <span className="pts">{user.pts} <span className="pts-label">pts</span></span>
              {user.trend === 'up' && <span className="trend up">▲</span>}
              {user.trend === 'down' && <span className="trend down">▼</span>}
              {user.trend === 'same' && <span className="trend same">-</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
