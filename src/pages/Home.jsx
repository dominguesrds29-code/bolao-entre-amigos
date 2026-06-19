import { Hero } from '../components/Hero'
import { Leaderboard } from '../components/Leaderboard'
import { MatchList } from '../components/MatchList'
import { groups } from '../data/matches'

export function Home() {
  const allMatches = groups.flatMap(group => group.matches).slice(0, 3);
  const leaderboard = [
    { pos: 1, name: 'Renato', pts: 124, trend: 'up' },
    { pos: 2, name: 'James Maddison', pts: 118, trend: 'same' },
    { pos: 3, name: 'Cody Fisher', pts: 105, trend: 'down' },
  ];

  return (
    <div className="page fade-in">
      <Hero />
      <Leaderboard data={leaderboard} />
      <MatchList title="Jogos de Hoje" matches={allMatches} />
    </div>
  )
}
