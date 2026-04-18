FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci

COPY server ./server
COPY shared ./shared

WORKDIR /app/server

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev:strict"]