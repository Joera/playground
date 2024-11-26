# Dockerfile

# Step 1: Build the Svelte app
FROM node:20 AS build

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install -g pm2

# Copy the rest of the app and build it
COPY . .
RUN npm run build

CMD ["pm2-runtime", "start", "./build/index.js"]
