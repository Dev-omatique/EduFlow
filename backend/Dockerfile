# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.11.1

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER node

COPY . .

EXPOSE 3001

# 👇 On ajoute JUSTE la migration avant le start
CMD sh -c "npx sequelize-cli db:migrate && npm start docker"