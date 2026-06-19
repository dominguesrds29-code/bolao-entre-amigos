import { getFlagUrl } from '../utils/flags';

export function GroupStandings({ groupName, data }) {
  return (
    <section className="standings-section">
      <h3 className="section-title">Classificação - {groupName}</h3>
      <div className="table-container">
        <table className="standings-table">
          <thead>
            <tr>
              <th title="Posição">#</th>
              <th className="team-col">Seleção</th>
              <th title="Pontos">PTS</th>
              <th title="Jogos">J</th>
              <th title="Vitórias" className="hide-mobile">V</th>
              <th title="Empates" className="hide-mobile">E</th>
              <th title="Derrotas" className="hide-mobile">D</th>
              <th title="Saldo de Gols">SG</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.pos}>
                <td className="pos-col">{row.pos}º</td>
                <td className="team-col">
                  {getFlagUrl(row.team) ? <img src={getFlagUrl(row.team)} className="flag" alt={row.team} /> : <span className="flag"></span>}
                  <span>{row.team}</span>
                </td>
                <td className="bold">{row.pts}</td>
                <td>{row.j}</td>
                <td className="hide-mobile">{row.v}</td>
                <td className="hide-mobile">{row.e}</td>
                <td className="hide-mobile">{row.d}</td>
                <td>{row.sg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
