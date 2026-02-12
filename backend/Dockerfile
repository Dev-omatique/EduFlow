# syntax=docker/dockerfile:1

FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install dependencies (prod only)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node ./src/bin/www"]