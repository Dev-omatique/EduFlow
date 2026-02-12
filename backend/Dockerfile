# syntax=docker/dockerfile:1
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --chown=node:node . .
USER node

EXPOSE 3001
CMD ["npm","start"]