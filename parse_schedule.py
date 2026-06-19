import re
import json

teams_pt = {
    "MEX": "México", "CAN": "Canadá", "BRA": "Brasil", "USA": "EUA", "GER": "Alemanha", "NED": "Holanda",
    "RSA": "África do Sul", "BIH": "Bósnia", "MAR": "Marrocos", "PAR": "Paraguai", "CUW": "Curaçao", "JPN": "Japão",
    "KOR": "Coreia do Sul", "QAT": "Qatar", "HAI": "Haiti", "AUS": "Austrália", "CIV": "C. do Marfim", "SWE": "Suécia",
    "CZE": "R. Tcheca", "SUI": "Suíça", "SCO": "Escócia", "TUR": "Turquia", "ECU": "Equador", "TUN": "Tunísia",
    "BEL": "Bélgica", "ESP": "Espanha", "FRA": "França", "ARG": "Argentina", "POR": "Portugal", "ENG": "Inglaterra",
    "EGY": "Egito", "CPV": "Cabo Verde", "SEN": "Senegal", "ALG": "Argélia", "COD": "RD Congo", "CRO": "Croácia",
    "IRN": "Irã", "KSA": "A. Saudita", "IRQ": "Iraque", "AUT": "Áustria", "UZB": "Uzbequistão", "GHA": "Gana",
    "NZL": "N. Zelândia", "URU": "Uruguai", "NOR": "Noruega", "JOR": "Jordânia", "COL": "Colômbia", "PAN": "Panamá"
}

with open('c:/xampp/htdocs/bolao-entre-amigos/src/copa2026_schedule_extracted.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def fix_line(line):
    # Fix things like CU v W -> CUW
    res = re.sub(r'([A-Z]{1,2})\s*v\s*([A-Z]{1,2})', r'\1\2', line)
    # also remove any remaining standalone v just in case
    res = res.replace(' v ', ' ')
    return res

matches = []

for i in range(len(lines)):
    # e.g. "16 15:00 32 15:00 52 15:00"
    if re.match(r'^\s*\d+\s+\d{2}:\d{2}', lines[i]):
        time_tokens = lines[i].strip().split()
        time_pairs = []
        for j in range(0, len(time_tokens)-1, 2):
            if ':' in time_tokens[j+1]:
                time_pairs.append((time_tokens[j], time_tokens[j+1]))
        
        if i + 1 < len(lines):
            home_line = fix_line(lines[i+1]).strip().split()
            away_idx = i + 2
            if i + 2 < len(lines) and ('v v' in lines[i+2] or lines[i+2].strip() == 'v' or lines[i+2].strip().startswith('v v')):
                away_idx = i + 3
            
            if away_idx < len(lines):
                away_line = fix_line(lines[away_idx]).strip().split()
                
                # zip them
                for k in range(min(len(time_pairs), len(home_line), len(away_line))):
                    m_num = time_pairs[k][0]
                    m_time = time_pairs[k][1]
                    home = home_line[k]
                    away = away_line[k]
                    
                    if home in teams_pt and away in teams_pt:
                        matches.append({
                            'id': f'm{m_num}',
                            'num': int(m_num),
                            'time': m_time,
                            'home': teams_pt[home],
                            'away': teams_pt[away],
                            'home_code': home,
                            'away_code': away
                        })

team_to_group = {
    "MEX": "A", "RSA": "A", "KOR": "A", "CZE": "A",
    "CAN": "B", "BIH": "B", "QAT": "B", "SUI": "B",
    "BRA": "C", "MAR": "C", "HAI": "C", "SCO": "C",
    "USA": "D", "PAR": "D", "AUS": "D", "TUR": "D",
    "GER": "E", "CUW": "E", "CIV": "E", "ECU": "E",
    "NED": "F", "JPN": "F", "SWE": "F", "TUN": "F",
    "BEL": "G", "EGY": "G", "IRN": "G", "NZL": "G",
    "ESP": "H", "CPV": "H", "KSA": "H", "URU": "H",
    "FRA": "I", "SEN": "I", "IRQ": "I", "NOR": "I",
    "ARG": "J", "ALG": "J", "AUT": "J", "JOR": "J",
    "POR": "K", "COD": "K", "UZB": "K", "COL": "K",
    "ENG": "L", "CRO": "L", "GHA": "L", "PAN": "L",
}

groups = {}
for g in "ABCDEFGHIJKL":
    groups[g] = []

matches.sort(key=lambda x: x['num'])

for m in matches:
    g = team_to_group[m['home_code']]
    groups[g].append({
        'id': m['id'],
        'date': f'Jogo {m["num"]}', 
        'time': m['time'],
        'location': 'A definir',
        'home': m['home'],
        'away': m['away'],
        'result': None
    })

# Ensure all 6 matches per group are present
import itertools
groups_teams_pt = {}
for code, pt_name in teams_pt.items():
    g = team_to_group[code]
    if g not in groups_teams_pt:
        groups_teams_pt[g] = []
    groups_teams_pt[g].append(pt_name)

missing_count = 0
for g, t_list in groups_teams_pt.items():
    all_pairs = list(itertools.combinations(t_list, 2))
    existing_pairs = set()
    for m in groups[g]:
        existing_pairs.add(tuple(sorted([m['home'], m['away']])))
    
    for pair in all_pairs:
        if tuple(sorted(pair)) not in existing_pairs:
            missing_count += 1
            groups[g].append({
                'id': f'm_missing_{missing_count}',
                'date': 'A definir',
                'time': '15:00',
                'location': 'A definir',
                'home': pair[0],
                'away': pair[1],
                'result': None
            })

out_groups = []
for g_name, g_matches in groups.items():
    out_groups.append({
        'name': g_name,
        'matches': g_matches
    })

js_code = "export const groups = " + json.dumps(out_groups, indent=2, ensure_ascii=False) + ";\n\n"
js_code += '''export const calculateScore = (betHome, betAway, realHome, realAway) => {
  if (betHome == null || betAway == null || realHome == null || realAway == null) return 0;
  const bh = parseInt(betHome);
  const ba = parseInt(betAway);
  const rh = parseInt(realHome);
  const ra = parseInt(realAway);
  if (bh === rh && ba === ra) return 10;
  const betDiff = bh - ba;
  const realDiff = rh - ra;
  const betWinner = betDiff > 0 ? 'home' : betDiff < 0 ? 'away' : 'draw';
  const realWinner = realDiff > 0 ? 'home' : realDiff < 0 ? 'away' : 'draw';
  if (betWinner === realWinner && betDiff === realDiff) return 7;
  if (betWinner === realWinner) return 5;
  if (bh === rh || ba === ra) return 2;
  return 0;
};
'''

with open('c:/xampp/htdocs/bolao-entre-amigos/src/data/matches.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print(f"Extracted {len(matches)} matches successfully!")
