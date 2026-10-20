FROM node:22.14.0-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --offline
COPY server.mjs README.md .env.example ./
COPY tools ./tools
COPY neon-frontier ./neon-frontier

EXPOSE 4173
CMD ["npm", "start"]
