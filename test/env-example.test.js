const test = require('node:test');
const assert = require('node:assert');
const { generer, comparer } = require('../env-example.js');

test('vide les valeurs, garde commentaires et export', () => {
  const sortie = generer('# base\nexport DB_URL=postgres://u:p@h/db\nPORT = 3000\n');
  assert.strictEqual(sortie, '# base\nexport DB_URL=\nPORT=\n');
});

test('ne recopie pas les valeurs multi-lignes entre guillemets', () => {
  const sortie = generer('KEY="-----BEGIN-----\nSECRET\n-----END-----"\nAPRES=1\n');
  assert.strictEqual(sortie, 'KEY=\nAPRES=\n');
  assert.ok(!sortie.includes('SECRET'));
});

test('une valeur entre guillemets sur une ligne ne casse pas la suite', () => {
  assert.strictEqual(generer('A="x y"\nB=\'z\'\nC=1\n'), 'A=\nB=\nC=\n');
});

test('--keep-values conserve les valeurs existantes', () => {
  assert.strictEqual(generer('PORT=8080\nTOKEN=abc\n', new Map([['PORT', '3000']])), 'PORT=3000\nTOKEN=\n');
});

test('comparer repère clés manquantes et obsolètes', () => {
  const r = comparer('A=1\nB=2\n', 'A=\nC=\n');
  assert.deepStrictEqual(r, { manquantes: ['B'], obsoletes: ['C'] });
});
