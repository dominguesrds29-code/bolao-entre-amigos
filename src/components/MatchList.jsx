import { useState, useEffect } from 'react';
import { useBets } from '../context/BetContext';
import { getFlagUrl } from '../utils/flags';

function MatchCard({ match }) {
  const { saveBet, getBet, getScore, realResults } = useBets();
  const bet = getBet(match.id);
  
  const [homeScore, setHomeScore] = useState(bet.home);
  const [awayScore, setAwayScore] = useState(bet.away);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHomeScore(bet.home);
    setAwayScore(bet.away);
  }, [bet.home, bet.away]);

  const handleSave = () => {
    if (homeScore !== '' && awayScore !== '') {
      saveBet(match.id, homeScore, awayScore);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const score = getScore(match.id);
  const real = realResults[match.id];

  // Lógica de Bloqueio 1h antes (match.date ex: "11 Jun", time: "16:00")
  const day = match.date.split(' ')[0].padStart(2, '0');
  // Assume 2026 e fuso horário do Brasil (-03:00) para calcular com a data do sistema
  const matchDateTimeStr = `2026-06-${day}T${match.time}:00-03:00`; 
  const matchDate = new Date(matchDateTimeStr);
  const now = new Date();
  
  const diffMs = matchDate.getTime() - now.getTime();
  const isLocked = diffMs <= 3600000; // 3600000 ms = 1 hora

  const disabled = real != null || isLocked;

  const homeFlag = getFlagUrl(match.home);
  const awayFlag = getFlagUrl(match.away);

  return (
    <div className={`match-card ${score !== null ? 'has-result' : ''} ${isLocked && score === null ? 'locked' : ''}`}>
      <div className="match-info">
        <span className="match-date">{match.date} • {match.time}</span>
        <span className="match-location">{match.location}</span>
      </div>
      
      {real ? (
        <div style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--wc-red)', fontWeight: 'bold'}}>
          FIM DE JOGO: {match.home} {real.home} x {real.away} {match.away}
        </div>
      ) : isLocked ? (
        <div style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--wc-orange)', fontWeight: 'bold'}}>
          🔒 PALPITES ENCERRADOS
        </div>
      ) : null}

      <div className="match-teams">
        <div className="team">
          {homeFlag ? <img src={homeFlag} className="flag" alt={match.home} /> : <span className="flag"></span>}
          <span className="team-name">{match.home}</span>
        </div>
        <div className="score-inputs">
          <input 
            type="text" maxLength="2" placeholder="0" 
            value={homeScore} onChange={(e) => setHomeScore(e.target.value.replace(/\D/g, ''))}
            disabled={disabled} 
          />
          <span>x</span>
          <input 
            type="text" maxLength="2" placeholder="0" 
            value={awayScore} onChange={(e) => setAwayScore(e.target.value.replace(/\D/g, ''))}
            disabled={disabled}
          />
        </div>
        <div className="team right">
          <span className="team-name">{match.away}</span>
          {awayFlag ? <img src={awayFlag} className="flag" alt={match.away} /> : <span className="flag"></span>}
        </div>
      </div>
      
      {score !== null ? (
        <div style={{background: 'var(--wc-purple)', color: 'white', textAlign: 'center', padding: '0.5rem', borderRadius: '8px', fontWeight: 'bold'}}>
          Você ganhou {score} pontos!
        </div>
      ) : (
        <button 
          className="btn-save" 
          onClick={handleSave} 
          disabled={isLocked}
          style={{ 
            background: saved ? 'var(--wc-green)' : (isLocked ? '#ccc' : ''),
            cursor: isLocked ? 'not-allowed' : 'pointer'
          }}
        >
          {saved ? 'Salvo ✓' : (isLocked ? 'Tempo Esgotado' : 'Salvar Palpite')}
        </button>
      )}
    </div>
  );
}

export function MatchList({ title, matches }) {
  return (
    <section className="matches-section">
      <h3 className="section-title">{title}</h3>
      <div className="matches-grid">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
