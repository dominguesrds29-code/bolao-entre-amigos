import { GroupStandings } from '../components/GroupStandings'

export function Tabelas() {
  const groupAStandings = [
    { pos: 1, team: 'México', pts: 0, j: 0, v: 0, e: 0, d: 0, sg: 0 },
    { pos: 2, team: 'República Tcheca', pts: 0, j: 0, v: 0, e: 0, d: 0, sg: 0 },
    { pos: 3, team: 'África do Sul', pts: 0, j: 0, v: 0, e: 0, d: 0, sg: 0 },
    { pos: 4, team: 'Coreia do Sul', pts: 0, j: 0, v: 0, e: 0, d: 0, sg: 0 }
  ];

  return (
    <div className="page fade-in">
      <h2 className="page-title">Tabelas Oficiais</h2>
      <GroupStandings groupName="A" data={groupAStandings} />
      {/* Aqui vão os outros grupos... */}
    </div>
  )
}
