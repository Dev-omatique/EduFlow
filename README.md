<div align="center">

# 🎓 EduFlow

### L'Espace Numérique de Travail moderne pour la vie scolaire

Notes, examens, emplois du temps, présences et communication réunis dans une seule plateforme,<br>
avec un accès adapté à chaque profil : élève, enseignant et vie scolaire.

<br>

[![CI](https://github.com/Dev-omatique/EduFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/Dev-omatique/EduFlow/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

<br>

[Fonctionnalités](#-fonctionnalités) •
[Démarrage rapide](#-démarrage-rapide) •
[Architecture](#-architecture) •
[Tests](#-tests) •
[Déploiement](#-cicd--déploiement) •
[Sécurité](#-sécurité)

<br>

<!-- Remplacer par une capture du tableau de bord -->
<img src="docs/screenshots/dashboard.png" alt="Tableau de bord EduFlow" width="85%">

</div>

<br>

## 📖 À propos

**EduFlow** est un ENT (Espace Numérique de Travail) développé en binôme dans le cadre de la formation **Concepteur Développeur d'Applications** à La Manu.

Le projet répond au besoin d'un établissement scolaire qui souhaite remplacer ses outils dispersés par une plateforme unique, sécurisée et simple à utiliser. Il est organisé en **monorepo** : un frontend Next.js et une API REST Express, reliés à une base PostgreSQL.

<br>

## ✨ Fonctionnalités

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>🎒 Élève</h3>
      <ul>
        <li>Tableau de bord personnalisé</li>
        <li>Consultation des notes et du relevé</li>
        <li>Statistiques de classe par examen</li>
        <li>Emploi du temps</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>🧑‍🏫 Enseignant</h3>
      <ul>
        <li>Gestion de ses cours</li>
        <li>Création d'examens (coefficient, barème, période)</li>
        <li>Saisie des notes, unitaire ou groupée</li>
        <li>Suivi des résultats de ses classes</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>🏫 Vie scolaire</h3>
      <ul>
        <li>Présences, planning et remarques disciplinaires</li>
        <li>Actualités et messages de groupe</li>
        <li>Utilisateurs, classes, matières et salles</li>
        <li>Rôles, permissions et périodes scolaires</li>
      </ul>
    </td>
  </tr>
</table>

<br>

## 🛠 Stack technique

| | Technologies |
|:--|:--|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · FullCalendar |
| **Backend** | Node.js · Express 4 · Sequelize 6 · JWT · bcrypt |
| **Base de données** | PostgreSQL |
| **Qualité** | Jest · Supertest · OpenAPI / Swagger |
| **DevOps** | Docker · GitHub Actions · Dokploy |

<br>

## 🚀 Démarrage rapide

> **Prérequis :** Node.js 20+, npm et PostgreSQL (local ou Docker).

```bash
# 1. Cloner le projet
git clone https://github.com/Dev-omatique/EduFlow.git
cd EduFlow

# 2. Lancer l'API
cd backend
cp .env.example .env        # renseigner les valeurs
npm ci
npm run migrate
npm run dev                 # → http://localhost:3001

# 3. Lancer l'interface (dans un second terminal)
cd frontend
cp .env.example .env        # renseigner les valeurs
npm ci
npm run dev                 # → http://localhost:3000
```

<details>
<summary><b>🐳 Lancer avec Docker</b></summary>

<br>

Chaque application dispose de son Dockerfile et de son `compose.yaml` :

```bash
cd backend  && docker compose up --build    # API sur le port 3001
cd frontend && docker compose up --build    # interface sur le port 3000
```

Pour le frontend, l'URL de l'API est injectée au build via l'argument `NEXT_PUBLIC_API_URL`.

</details>

<details>
<summary><b>⚙️ Variables d'environnement</b></summary>

<br>

> ⚠️ Ne jamais commiter de fichier `.env`. Des modèles sont fournis dans chaque `.env.example`.

**Backend** (`backend/.env`)

| Variable | Rôle |
|:--|:--|
| `NODE_ENV` | `development`, `test` ou `production` |
| `PORT` | Port de l'API (défaut : `3001`) |
| `DATABASE_URL` | Connexion PostgreSQL : `postgresql://user:password@host:5432/base` |
| `FRONTEND_URL` | Origine autorisée par CORS |
| `JWT_SECRET` | Secret de signature des JWT |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Compte utilisé par certains tests |

**Frontend** (`frontend/.env`)

| Variable | Rôle |
|:--|:--|
| `NODE_ENV` | Environnement |
| `PORT` | Port de l'interface |
| `NEXT_PUBLIC_API_URL` | URL de l'API |

</details>

<details>
<summary><b>📜 Scripts disponibles</b></summary>

<br>

| Dossier | Commande | Action |
|:--|:--|:--|
| `backend` | `npm run dev` | API en mode développement (rechargement auto) |
| `backend` | `npm start` | API en mode production |
| `backend` | `npm run migrate` | Applique les migrations |
| `backend` | `npm test` | Lance les tests |
| `frontend` | `npm run dev` | Interface en mode développement |
| `frontend` | `npm run build` | Build de production |
| `frontend` | `npm start` | Sert le build de production |
| `frontend` | `npm run lint` | Analyse du code avec ESLint |

</details>

<br>

## 🏗 Architecture

```mermaid
flowchart LR
    U([👤 Utilisateur]) --> F

    subgraph F[Frontend · Next.js]
        P[Pages & composants] --> A[AuthContext · RoleGuard]
    end

    F -- "HTTP / JSON<br>cookie JWT" --> B

    subgraph B[Backend · Express]
        R[Routes] --> M[authRequired<br>checkPermission]
        M --> C[Controllers]
        C --> S[Modèles Sequelize]
    end

    S -- SQL --> D[(PostgreSQL)]
```

Chaque requête vers l'API traverse la même chaîne : **vérification du JWT** → **contrôle de la permission** → **logique métier** → **accès aux données**.

<details>
<summary><b>📁 Structure du projet</b></summary>

<br>

```
EduFlow/
├── .github/workflows/ci.yml   # Intégration continue
├── backend/
│   ├── src/
│   │   ├── app.js             # Configuration Express
│   │   ├── bin/www            # Démarrage du serveur
│   │   ├── config/            # Connexion par environnement
│   │   ├── controllers/       # Logique métier
│   │   ├── docs/openapi.yml   # Documentation de l'API
│   │   ├── middlewares/       # Auth, permissions, erreurs
│   │   ├── migrations/        # Évolutions du schéma
│   │   ├── models/            # Modèles Sequelize
│   │   ├── routes/            # Routes de l'API
│   │   ├── seeders/           # Données initiales
│   │   └── tests/             # Tests Jest
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── app/               # Pages (App Router)
    │   ├── components/        # Composants UI et métier
    │   └── context/           # État global (auth, sidebar)
    └── Dockerfile
```

</details>

<br>

## 🔐 Rôles et permissions

EduFlow s'appuie sur un **RBAC** (contrôle d'accès basé sur les rôles) : chaque rôle dispose d'un ensemble de permissions (`VIEW_GRADES`, `EDIT_GRADES`, `CREATE_EXAMS`, `MANAGE_USERS`…), vérifiées sur chaque route protégée.

Des règles métier viennent compléter ces droits :

- un **élève** ne voit que ses propres notes ;
- un **enseignant** ne voit que les notes de ses examens.

> ℹ️ Les rôles et permissions de base doivent être présents en base avant la première utilisation.

<br>

## 📡 API

| | |
|:--|:--|
| **Préfixe** | `/api` |
| **Documentation** | Swagger UI sur `/swagger` |
| **Routes publiques** | `POST /api/auth/login` · `POST /api/auth/register` · `POST /api/auth/logout` |
| **Routes protégées** | `/users` · `/notes` · `/exams` · `/academic-periods` · `/courses` · `/attendances` · `/subjects` · `/rooms` · `/news` · `/roles` · `/permissions`… |

<br>

## 🧪 Tests

**4 suites, 31 tests** (Jest + Supertest), exécutés automatiquement à chaque pull request.

| Suite | Ce qui est vérifié |
|:--|:--|
| `api.test.js` | Authentification, utilisateurs et cours, en intégration sur PostgreSQL |
| `academicPeriodController.test.js` | Règles des périodes scolaires (trimestres, semestres) |
| `examAcademicPeriod.test.js` | Rattachement des examens aux périodes |
| `noteController.test.js` | Notes, autorisations par rôle, saisie groupée en transaction |

```bash
cd backend
npm test                  # lancer les tests
npm test -- --coverage    # avec la couverture de code
```

<br>

## 🔄 CI/CD & déploiement

```mermaid
flowchart LR
    A[💻 Push / Pull Request] --> B[⚙️ GitHub Actions<br>PostgreSQL temporaire<br>migrations + tests]
    B -- ✅ tests verts --> C[🔀 Merge sur main]
    B -- ❌ échec --> A
    C --> D[🚀 Dokploy<br>build des images Docker]
    D --> E[🌐 Production sur VPS]
```

- **Intégration continue** : à chaque push ou pull request vers `main` et `develop`, GitHub Actions démarre une base PostgreSQL temporaire, applique les migrations, lance les tests avec couverture et publie les rapports en artefacts.
- **Déploiement continu** : Dokploy détecte les changements sur la branche de production, reconstruit les images à partir des Dockerfiles du frontend et du backend, puis met les conteneurs à jour.

<br>

## 🛡 Sécurité

| Domaine | Mesures |
|:--|:--|
| **Mots de passe** | Hachage bcrypt · 8 caractères minimum, majuscule, minuscule et chiffre |
| **Authentification** | JWT (expiration 1 h) dans un cookie `httpOnly`, `sameSite`, `secure` en production |
| **Force brute** | Blocage de 15 minutes après 5 échecs de connexion |
| **Autorisations** | RBAC côté API · `RoleGuard` côté interface |
| **Échanges** | CORS limité à l'origine du frontend |
| **Données** | Requêtes paramétrées via l'ORM · secrets en variables d'environnement |
| **Serveur** | Accès SSH uniquement par clé |

<br>

## 🌿 Workflow Git

On suit **Git Flow** : `main` (production), `develop` (intégration) et des branches `feature/*`.
Les branches `main` et `develop` sont **protégées** : toute fusion passe par une pull request dont la CI doit réussir. Le projet est piloté en **sprints sur Jira**.

<br>

## 👥 Auteurs

<table>
  <tr>
    <td align="center"><b>Théo Houriez</b></td>
    <td align="center"><b>Marius Hazart</b></td>
  </tr>
</table>

<div align="center">
<br>
<sub>Projet réalisé à La Manu · Titre Concepteur Développeur d'Applications</sub>
</div>