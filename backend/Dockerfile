# syntax=docker/dockerfile:1
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy only necessary source folder
COPY src ./src

EXPOSE 3001

CMD ["sh", "-c", "npx sequelize-cli db:migrate && node ./src/bin/www"]