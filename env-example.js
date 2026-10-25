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
const lignes = fs.readFileSync(src, 'utf8').split(/\r?\n/);
const out = [];
for (let i = 0; i < lignes.length; i++) {
  const m = lignes[i].match(/^\s*(export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(["']?)(.*)$/);
  if (!m) { out.push(lignes[i]); continue; }
  out.push(`${m[1] || ''}${m[2]}=`);
  // valeur entre guillemets sur plusieurs lignes : on ignore les lignes de la valeur (sinon elles fuitent)
  const q = m[3];
  if (q && !m[4].includes(q)) {
    while (i + 1 < lignes.length && !lignes[++i].includes(q)) { /* ligne de la valeur ignorée */ }
  }
}
fs.writeFileSync(dest, out.join('\n'));
const n = out.filter(l => /^\s*(export\s+)?[A-Za-z_][A-Za-z0-9_]*=/.test(l)).length;
console.log(`${dest} généré (${n} variable${n > 1 ? 's' : ''}, aucune valeur copiée).`);
