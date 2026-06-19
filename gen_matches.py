import json

groups_data = {
    'A': ['México', 'República Tcheca', 'África do Sul', 'Coreia do Sul'],
    'B': ['Canadá', 'Suíça', 'Bósnia', 'Qatar'],
    'C': ['Brasil', 'Haiti', 'Escócia', 'Marrocos'],
    'D': ['EUA', 'Turquia', 'Austrália', 'Paraguai'],
    'E': ['Alemanha', 'Curaçao', 'C. do Marfim', 'Equador'],
    'F': ['Holanda', 'Tunísia', 'Suécia', 'Japão'],
    'G': ['Bélgica', 'Egito', 'Irã', 'N. Zelândia'],
    'H': ['Espanha', 'Cabo Verde', 'Uruguai', 'A. Saudita'],
    'I': ['França', 'Senegal', 'Noruega', 'Iraque'],
    'J': ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
    'K': ['Portugal', 'RD. Congo', 'Colômbia', 'Uzbequistão'],
    'L': ['Inglaterra', 'Croácia', 'Panamá', 'Gana']
}

dates = ['11 Jun', '12 Jun', '17 Jun', '17 Jun', '22 Jun', '22 Jun']
times = ['16:00', '13:00', '16:00', '19:00', '16:00', '16:00']
locs = ['Estádio Azteca', 'Estádio BMO', 'Estádio Azteca', 'Estádio BMO', 'Estádio Azteca', 'Estádio BMO']

out_groups = []
m_idx = 1
for g_name, teams in groups_data.items():
    matches = [
        {'id': f'm{m_idx}', 'date': dates[0], 'time': times[0], 'location': locs[0], 'home': teams[0], 'away': teams[1], 'result': None},
        {'id': f'm{m_idx+1}', 'date': dates[1], 'time': times[1], 'location': locs[1], 'home': teams[2], 'away': teams[3], 'result': None},
        {'id': f'm{m_idx+2}', 'date': dates[2], 'time': times[2], 'location': locs[2], 'home': teams[0], 'away': teams[2], 'result': None},
        {'id': f'm{m_idx+3}', 'date': dates[3], 'time': times[3], 'location': locs[3], 'home': teams[1], 'away': teams[3], 'result': None},
        {'id': f'm{m_idx+4}', 'date': dates[4], 'time': times[4], 'location': locs[4], 'home': teams[0], 'away': teams[3], 'result': None},
        {'id': f'm{m_idx+5}', 'date': dates[5], 'time': times[5], 'location': locs[5], 'home': teams[1], 'away': teams[2], 'result': None},
    ]
    m_idx += 6
    out_groups.append({'name': g_name, 'matches': matches})

js_code = "export const groups = " + json.dumps(out_groups, indent=2, ensure_ascii=False) + ";\n\n"
js_code += """export const calculateScore = (betHome, betAway, realHome, realAway) => {
  if (betHome == null || betAway == null || realHome == null || realAway == null) return 0;
  
  const bh = parseInt(betHome);
  const ba = parseInt(betAway);
  const rh = parseInt(realHome);
  const ra = parseInt(realAway);

  // 1. Placar Exato: 10 pontos
  if (bh === rh && ba === ra) return 10;

  const betDiff = bh - ba;
  const realDiff = rh - ra;
  
  const betWinner = betDiff > 0 ? 'home' : betDiff < 0 ? 'away' : 'draw';
  const realWinner = realDiff > 0 ? 'home' : realDiff < 0 ? 'away' : 'draw';

  // 2. Vencedor (ou empate) + Saldo: 7 pontos
  if (betWinner === realWinner && betDiff === realDiff) return 7;

  // 3. Apenas vencedor (ou empate): 5 pontos
  if (betWinner === realWinner) return 5;

  // 4. Um dos gols exatos: 2 pontos
  if (bh === rh || ba === ra) return 2;

  // 5. Errou tudo: 0 pontos
  return 0;
};
"""

with open('c:/xampp/htdocs/bolao-entre-amigos/src/data/matches.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
