import { Leaderboard } from '../components/Leaderboard'

export function Ranking() {
  const leaderboard = [
    { pos: 1, name: 'Renato', pts: 124, trend: 'up' },
    { pos: 2, name: 'James Maddison', pts: 118, trend: 'same' },
    { pos: 3, name: 'Cody Fisher', pts: 105, trend: 'down' },
    { pos: 4, name: 'Maria Silva', pts: 92, trend: 'up' },
    { pos: 5, name: 'Lucas Costa', pts: 88, trend: 'down' },
    { pos: 6, name: 'Ana Souza', pts: 75, trend: 'same' }
  ];

  return (
    <div className="page fade-in">
      <h2 className="page-title">Ranking Geral</h2>
      <Leaderboard data={leaderboard} />
    </div>
  )
}
