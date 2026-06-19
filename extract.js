const fs = require('fs');
const pdf = require('pdf-parse');
pdf(fs.readFileSync('c:/xampp/htdocs/bolao-entre-amigos/public/tabela.pdf')).then(data => console.log(data.text));
