cat << 'EOF' > README.md
# 🎓 EduFlow — Plateforme ENT Next-Gen

> **Un environnement numérique de travail (ENT) moderne inspiré de Pronote, conçu pour simplifier la vie scolaire.**

---

## 🔹 Présentation
**EduFlow** est un projet réalisé en Bac +3, structuré en **monorepo**. Il permet de gérer les notes, les absences et les ressources pédagogiques via une interface fluide et intuitive, avec une identité visuelle aux tons **bleu clair**.

## 🛠 Stack Technique
L'architecture repose sur des technologies modernes pour garantir performance et scalabilité :

* **Frontend :** Next.js 14+ (React)
* **Backend :** Node.js (API REST)
* **ORM :** Prisma
* **Base de données :** PostgreSQL
* **Workflow :** Git Flow (develop / main)
* **Conteneurisation :** Docker (DEV / PROD à venir)

---

## 🚀 Installation (Local)

### 1️⃣ Prérequis
* **Node.js** (v20 ou supérieur)
* **npm**
* **PostgreSQL** (local ou Docker)

### 2️⃣ Lancement du Frontend
```bash
cd frontend
npm ci
npm run dev
```
Accessible sur : http://localhost:3000 


## 3️⃣ Lancement du Backend

```bash
cd backend
npm ci
npm run dev
```
Accessible sur : http://localhost:3001 

## ⚙️ Configuration des variables d’environnement

⚠️ Ne jamais commiter les fichiers **.env**

Frontend — **frontend/.env**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```
Backend — **backend/.env**

```bash
DATABASE_URL=postgresql://eduflow:eduflow_password@localhost:5432/eduflow
JWT_SECRET=supersecret
```

## 📁 Structure du Projet
```bash
EduFlow/
├── frontend/    # Interface utilisateur (Next.js)
├── backend/     # API & logique métier (Node.js + Prisma)
├── .gitignore   # Exclusion des fichiers sensibles
└── README.md    # Documentation du projet
```

## 🌿 Workflow Git
Nous utilisons la méthodologie Git Flow :

**main** : branche de production (stable)

**develop** : branche d’intégration

**feature/*** : branches de développement

Les branches **main** et **develop** sont protégées.
Une **Pull Request** est obligatoire pour toute fusion.