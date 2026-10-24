#!/usr/bin/env node
// env-example : génère .env.example à partir de .env (clés et commentaires conservés, valeurs vidées).
// Usage : node dev/env-example.js [chemin/.env] [chemin/.env.example]
const fs = require('fs');
const src = process.argv[2] || '.env';
const dest = process.argv[3] || '.env.example';

if (!fs.existsSync(src)) {
  console.error(`Fichier introuvable : ${src}`);
  process.exit(1);
}
const out = fs.readFileSync(src, 'utf8').split(/\r?\n/).map(line => {
  const m = line.match(/^\s*(export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  return m ? `${m[1] || ''}${m[2]}=` : line;
});
fs.writeFileSync(dest, out.join('\n'));
const n = out.filter(l => /^\s*(export\s+)?[A-Za-z_][A-Za-z0-9_]*=/.test(l)).length;
console.log(`${dest} généré (${n} variable${n > 1 ? 's' : ''}, aucune valeur copiée).`);
