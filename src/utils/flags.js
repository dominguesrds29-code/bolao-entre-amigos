export const countryToIso = {
  "México": "mx", "Canadá": "ca", "Brasil": "br", "EUA": "us", "Alemanha": "de", "Holanda": "nl",
  "África do Sul": "za", "Bósnia": "ba", "Marrocos": "ma", "Paraguai": "py", "Curaçao": "cw", "Japão": "jp",
  "Coreia do Sul": "kr", "Qatar": "qa", "Haiti": "ht", "Austrália": "au", "C. do Marfim": "ci", "Suécia": "se",
  "R. Tcheca": "cz", "Suíça": "ch", "Escócia": "gb-sct", "Turquia": "tr", "Equador": "ec", "Tunísia": "tn",
  "Bélgica": "be", "Espanha": "es", "França": "fr", "Argentina": "ar", "Portugal": "pt", "Inglaterra": "gb-eng",
  "Egito": "eg", "Cabo Verde": "cv", "Senegal": "sn", "Argélia": "dz", "RD Congo": "cd", "Croácia": "hr",
  "Irã": "ir", "A. Saudita": "sa", "Iraque": "iq", "Áustria": "at", "Uzbequistão": "uz", "Gana": "gh",
  "N. Zelândia": "nz", "Uruguai": "uy", "Noruega": "no", "Jordânia": "jo", "Colômbia": "co", "Panamá": "pa"
};

export const getFlagUrl = (countryName) => {
  const iso = countryToIso[countryName];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
};
