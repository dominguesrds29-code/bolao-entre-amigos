import { useState } from 'react';
import { useBets } from '../context/BetContext';
import { groups } from '../data/matches';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Navigate } from 'react-router-dom';
import { getFlagUrl } from '../utils/flags';

export function Admin() {
  const { role, realResults } = useBets();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Security check
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const allMatches = groups.flatMap(g => g.matches);

  const handleSaveResult = async (matchId, homeScore, awayScore) => {
    setLoading(true);
    setSuccess('');
    try {
      const updatedResults = {
        ...realResults,
      };
      
      if (homeScore === '' || awayScore === '') {
        delete updatedResults[matchId];
      } else {
        updatedResults[matchId] = {
          home: parseInt(homeScore),
          away: parseInt(awayScore)
        };
      }

      const resultsRef = doc(db, 'system', 'real_results');
      await setDoc(resultsRef, { matches: updatedResults }, { merge: true });
      
      setSuccess('Placar salvo com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar placar');
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Painel do Administrador</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Defina os placares reais oficiais abaixo. Isso irá atualizar a pontuação de todos os participantes automaticamente.
      </p>

      {success && (
        <div style={{ background: 'var(--wc-green)', color: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
          {success}
        </div>
      )}

      <div className="matches-grid">
        {allMatches.map(match => {
          const currentReal = realResults[match.id] || { home: '', away: '' };
          return (
            <div key={match.id} className="match-card" style={{ border: '2px solid var(--wc-orange)' }}>
              <div className="match-info">
                <span className="match-date">{match.date}</span>
                <span className="match-location" style={{ color: 'var(--wc-orange)', fontWeight: 'bold' }}>[RESULTADO OFICIAL]</span>
              </div>
              <div className="match-teams">
                <div className="team">
                  {getFlagUrl(match.home) ? <img src={getFlagUrl(match.home)} className="flag" alt={match.home} /> : <span className="flag"></span>}
                  <span className="team-name">{match.home}</span>
                </div>
                <div className="score-inputs">
                  <input 
                    type="text" maxLength="2" placeholder="0" 
                    defaultValue={currentReal.home}
                    onBlur={(e) => handleSaveResult(match.id, e.target.value, document.getElementById(`away-${match.id}`).value)}
                    id={`home-${match.id}`}
                    disabled={loading}
                  />
                  <span>x</span>
                  <input 
                    type="text" maxLength="2" placeholder="0" 
                    defaultValue={currentReal.away}
                    onBlur={(e) => handleSaveResult(match.id, document.getElementById(`home-${match.id}`).value, e.target.value)}
                    id={`away-${match.id}`}
                    disabled={loading}
                  />
                </div>
                <div className="team right">
                  <span className="team-name">{match.away}</span>
                  {getFlagUrl(match.away) ? <img src={getFlagUrl(match.away)} className="flag" alt={match.away} /> : <span className="flag"></span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
