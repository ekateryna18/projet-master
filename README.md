# Projet Master — CI/CD & Infrastructure

## Registry Docker privé

Un registry Docker privé est déployé via `docker-compose.registry.yml` et exposé derrière **Traefik**.

| Composant | Image | URL |
|---|---|---|
| Registry | `registry:2` | `https://master-pr-katy.a3n.fr/v2` |
| Registry UI | `joxit/docker-registry-ui` | `https://master-pr-katy.a3n.fr` |

**Authentification** : htpasswd (bcrypt) — fichier `auth/htpasswd`
**Stockage** : volume local `./data/registry`
**TLS** : certificat Let's Encrypt via Traefik (`letsencrypt` cert resolver)

Traefik route les requêtes `/v2` vers le registry (priorité 10) et le reste vers l'UI (priorité 1).
Un middleware de rate limiting est appliqué sur le registry (20 req/s, burst 50).

---

## Workflows GitHub Actions

### 1. CI/CD Pipeline — `ci-cd.yml`

Déclenché sur les pushs et pull requests vers `main` et `develop`, ainsi que sur les tags `v*.*.*`.

```
lint ──┬── test ──────────────────┬── build-and-push ── deploy
       └── semgrep (sécurité) ───┘
```

| Job | Déclencheur | Description |
|---|---|---|
| **lint** | Toujours | ESLint sur le code Node.js (`app/`) |
| **test** | Après lint | Tests Jest |
| **semgrep** | PRs + push main/develop | Scan de sécurité statique (voir ci-dessous) |
| **build-and-push** | Push uniquement, après test + semgrep | Build multi-arch (`amd64`/`arm64`) et push vers le registry privé |
| **deploy** | Push sur `main` ou tag `v*` | Déploiement SSH sur le serveur de production via `docker compose pull && up` |

### 2. Semgrep Security Scan — `semgrep.yml`

Scan de sécurité statique indépendant, déclenché sur chaque PR et push sur `main`.

- Utilise l'image Docker `returntocorp/semgrep`
- Règles : `p/security-audit`
- Le rapport JSON (`semgrep-results.json`) est sauvegardé en artifact GitHub Actions
- Le job échoue (`--error`) si des vulnérabilités sont détectées

### 3. Sync Prod → Dev — `sync-prod-to-dev.yml`

Déclenché automatiquement après le succès du pipeline CI/CD sur `main`.

- Merge automatique de `main` dans `develop` via `git merge --no-edit`
- En cas de conflit : abandon du merge + échec du job (résolution manuelle requise)
- Peut aussi être déclenché manuellement via `repository_dispatch`

---

## Sécurité — Pre-commit Hook

Semgrep est intégré en pre-commit hook via `.pre-commit-config.yaml`.
Chaque `git commit` déclenche un scan automatique — le commit est bloqué si des findings sont détectés.

```bash
# Installation
pip install pre-commit
pre-commit install

# Test manuel
pre-commit run --all-files
```
