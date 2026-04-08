FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["node", "server.js"]
