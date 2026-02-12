FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src
COPY config ./config
COPY migrations ./migrations
COPY models ./models

EXPOSE 3001

CMD ["sh", "-c", "npx sequelize-cli db:migrate && node ./src/bin/www"]