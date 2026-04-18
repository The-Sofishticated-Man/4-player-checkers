FROM node:20-alpine

WORKDIR /app

COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client ./client
COPY shared ./shared
COPY server ./server

WORKDIR /app/client

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]