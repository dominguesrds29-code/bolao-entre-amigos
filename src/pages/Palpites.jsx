import { MatchList } from '../components/MatchList'
import { groups } from '../data/matches'

export function Palpites() {
  return (
    <div className="page fade-in">
      <h2 className="page-title">Meus Palpites</h2>
      {groups.map(group => (
        <MatchList key={group.name} title={`Grupo ${group.name}`} matches={group.matches} />
      ))}
    </div>
  )
}
