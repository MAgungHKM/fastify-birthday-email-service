FROM node:16.13.1-alpine

LABEL maintainer="MAgungHKM"

# Set the working directory
WORKDIR /app

# Copy source code
COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN npm install -g pnpm fastify-cli

# Running npm install
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy the rest of your app's source code from your host to your image filesystem.
COPY --chown=node:node . .

RUN pnpm build:ts

# Switch to 'node' user
USER node

# Open the mapped port
EXPOSE 3000

CMD ["fastify", "start", "-l", "info", "dist/app.js"]