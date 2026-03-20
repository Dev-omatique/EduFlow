# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /usr/src/app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/next.config.* ./

EXPOSE 3000
CMD ["npm", "run", "start"]