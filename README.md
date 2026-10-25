# env-example

Génère un fichier `.env.example` à partir de ton `.env`, **sans jamais copier les valeurs**.

Un `.env.example` à jour permet à n'importe qui (toi dans six mois, un coéquipier, un serveur de déploiement) de savoir quelles variables d'environnement il faut renseigner, sans exposer de secret dans Git.

- Aucune dépendance, un seul fichier, Node 18 ou plus.
- Les commentaires, les lignes vides et le mot-clé `export` sont conservés.
- Les valeurs entre guillemets sur plusieurs lignes (clé privée, JSON) sont entièrement supprimées.

## Exemple

`.env` (ne jamais le versionner) :

```dotenv
# Base de données
DB_URL=postgres://admin:motdepasse@localhost:5432/app
export SUPABASE_KEY="eyJhbGciOi..."

# Clé de signature
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkq
-----END PRIVATE KEY-----"
PORT=3000
```

Après `node env-example.js` :

```dotenv
# Base de données
DB_URL=
export SUPABASE_KEY=

# Clé de signature
PRIVATE_KEY=
PORT=
```

## Installation

Sans rien installer (depuis GitHub) :

```bash
npx github:AGBERESahir/env-example
```

Ou en clonant le dépôt :

```bash
git clone https://github.com/AGBERESahir/env-example.git
cd env-example
node env-example.js --help
```

Pour l'utiliser partout sur ta machine : `npm install -g .` dans le dossier cloné, puis `env-example`.

## Utilisation

```text
env-example [.env] [.env.example] [options]
```

| Argument ou option | Effet |
|---|---|
| `[.env]` | Fichier source (défaut : `.env` dans le dossier courant). |
| `[.env.example]` | Fichier généré (défaut : `.env.example`). Il est écrasé s'il existe déjà. |
| `--keep-values` | Conserve les valeurs **déjà présentes dans `.env.example`** pour les clés qui existent encore. Pratique pour garder `PORT=3000` ou `NODE_ENV=development`, qui ne sont pas secrets. |
| `--check` | N'écrit rien : compare les clés de `.env` et de `.env.example`. Affiche les clés manquantes (`✗`) et obsolètes (`?`). Code de sortie `1` s'il manque des clés dans l'exemple. |
| `-h`, `--help` | Affiche l'aide. |

### Exemples de commandes

```bash
# Générer .env.example à côté de .env
env-example

# Chemins personnalisés
env-example apps/api/.env apps/api/.env.example

# Régénérer en gardant les valeurs publiques déjà écrites à la main
env-example --keep-values

# Vérifier avant un commit que .env.example est à jour
env-example --check
```

### Astuce : vérifier avant chaque commit

Ajoute `env-example --check` à ton hook `pre-commit` (ou à un script `npm run verif`) pour ne plus jamais oublier une nouvelle variable. Combine-le avec [secret-guard](https://github.com/AGBERESahir/secret-guard), qui bloque les commits contenant de vrais secrets.

## Garde-fous

- **Source = destination** : si les deux chemins désignent le même fichier, l'outil refuse d'écrire (tes valeurs seraient perdues).
- **Clés en double** : un avertissement est affiché si une clé est définie plusieurs fois dans `.env`.
- **Fichier introuvable** : message clair et code de sortie `1`.

## Ce que l'outil ne fait pas

- Il ne détecte pas les secrets glissés dans les **commentaires** : ils sont conservés tels quels. Relis le résultat avant de le publier.
- Il ne gère pas l'interpolation (`${AUTRE_VARIABLE}`) : la valeur est simplement supprimée.

## Développement

```bash
npm test      # tests node:test, aucune dépendance à installer
```

Les fonctions `analyser`, `generer` et `comparer` sont exportées par `env-example.js` si tu veux les réutiliser dans un script.

## Licence

MIT, voir [LICENSE](LICENSE).
