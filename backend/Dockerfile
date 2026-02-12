# syntax=docker/dockerfile:1

FROM node:20-alpine

# Environnement production
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* ./

# Installation des dépendances (prod uniquement)
RUN npm ci --omit=dev

# Copie du code source avec bons droits
COPY --chown=node:node . .

# Sécurité : on n’exécute pas en root
USER node

# Port exposé par Express
EXPOSE 3001

# Lance les migrations puis démarre le serveur
CMD ["npm","run","start:prod"]