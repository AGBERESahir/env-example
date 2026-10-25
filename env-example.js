#!/usr/bin/env node
// env-example : génère .env.example à partir de .env (clés et commentaires conservés, valeurs vidées).
// Voir README.md pour toutes les options.
const fs = require('fs');
const path = require('path');

const AIDE = `env-example : génère .env.example à partir de .env, sans copier les valeurs.

Usage :
  env-example [.env] [.env.example] [options]

Options :
  --check          Compare les clés de .env et de .env.example, sans rien écrire
                   (code de sortie 1 s'il manque des clés dans .env.example)
  --keep-values    Conserve les valeurs déjà présentes dans .env.example
                   (utile pour PORT=3000, NODE_ENV=development, etc.)
  -h, --help       Affiche cette aide`;

// Une valeur entre guillemets peut s'étendre sur plusieurs lignes (clé privée, JSON...).
function ferme(texte, guillemet, depart) {
  for (let i = depart; i < texte.length; i++) {
    if (texte[i] === '\\' && guillemet === '"') { i++; continue; }
    if (texte[i] === guillemet) return true;
  }
  return false;
}

// Découpe un fichier .env en éléments : lignes brutes (commentaires, vides) ou variables.
function analyser(texte) {
  const lignes = texte.split(/\r?\n/);
  const elements = [];
  for (let i = 0; i < lignes.length; i++) {
    const m = lignes[i].match(/^(\s*export\s+|\s*)([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (!m) { elements.push({ type: 'brut', texte: lignes[i] }); continue; }
    let valeur = m[3].trim();
    const q = valeur[0];
    if ((q === '"' || q === "'") && !ferme(valeur, q, 1)) {
      while (i + 1 < lignes.length) {      // on avale les lignes de la valeur multi-lignes
        i++;
        valeur += '\n' + lignes[i];
        if (ferme(lignes[i], q, 0)) break;
      }
    }
    elements.push({ type: 'variable', export: /export/.test(m[1]), cle: m[2], valeur });
  }
  return elements;
}

function generer(texteEnv, valeursConservees = new Map()) {
  return analyser(texteEnv).map(e => {
    if (e.type === 'brut') return e.texte;
    return `${e.export ? 'export ' : ''}${e.cle}=${valeursConservees.get(e.cle) ?? ''}`;
  }).join('\n').replace(/\n*$/, '\n');
}

const cles = els => els.filter(e => e.type === 'variable').map(e => e.cle);

function comparer(texteEnv, texteExemple) {
  const env = new Set(cles(analyser(texteEnv)));
  const ex = new Set(cles(analyser(texteExemple)));
  return {
    manquantes: [...env].filter(k => !ex.has(k)),
    obsoletes: [...ex].filter(k => !env.has(k)),
  };
}

function main(argv) {
  if (argv.includes('-h') || argv.includes('--help')) { console.log(AIDE); return 0; }
  const options = new Set(argv.filter(a => a.startsWith('--')));
  const pos = argv.filter(a => !a.startsWith('--'));
  const src = pos[0] || '.env';
  const dest = pos[1] || '.env.example';

  if (path.resolve(src) === path.resolve(dest)) {
    console.error('Le fichier source et le fichier de destination sont identiques : les valeurs seraient perdues.');
    return 1;
  }
  if (!fs.existsSync(src)) { console.error(`Fichier introuvable : ${src}`); return 1; }
  const texteEnv = fs.readFileSync(src, 'utf8');

  const doublons = cles(analyser(texteEnv)).filter((k, i, t) => t.indexOf(k) !== i);
  if (doublons.length) console.error(`Attention, clé(s) définie(s) plusieurs fois : ${[...new Set(doublons)].join(', ')}`);

  if (options.has('--check')) {
    if (!fs.existsSync(dest)) { console.error(`Fichier introuvable : ${dest}`); return 1; }
    const { manquantes, obsoletes } = comparer(texteEnv, fs.readFileSync(dest, 'utf8'));
    manquantes.forEach(k => console.log(`✗ ${k} : dans ${src} mais absente de ${dest}`));
    obsoletes.forEach(k => console.log(`? ${k} : dans ${dest} mais absente de ${src} (obsolète ?)`));
    if (!manquantes.length && !obsoletes.length) console.log(`${dest} est à jour.`);
    return manquantes.length ? 1 : 0;
  }

  const conservees = new Map();
  if (options.has('--keep-values') && fs.existsSync(dest)) {
    analyser(fs.readFileSync(dest, 'utf8')).filter(e => e.type === 'variable').forEach(e => conservees.set(e.cle, e.valeur));
  }
  const existait = fs.existsSync(dest);
  fs.writeFileSync(dest, generer(texteEnv, conservees));
  const n = cles(analyser(texteEnv)).length;
  console.log(`${dest} ${existait ? 'mis à jour' : 'généré'} (${n} variable${n > 1 ? 's' : ''}${conservees.size ? ', valeurs existantes conservées' : ', aucune valeur copiée'}).`);
  return 0;
}

module.exports = { analyser, generer, comparer };
if (require.main === module) process.exit(main(process.argv.slice(2)));
