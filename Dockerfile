FROM node:lts

LABEL maintainer="MAgungHKM"

# # Install required packages
# RUN apt-get update --yes && \
#   apt-get install --yes --no-install-recommends openssl libssl1.1 libssl-dev libc6 libc-dev && \
#   rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy source code
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Running npm install
RUN npm install -g pnpm fastify-cli
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy the rest of your app's source code from your host to your image filesystem.
COPY --chown=node:node . .
RUN sed -i 's/localhost/postgres/g' .env

# build app
RUN pnpx prisma generate && pnpm build:ts

# Switch to 'node' user
USER node

# Open the mapped port
EXPOSE 3000

CMD ["fastify", "start", "-l", "info", "dist/app.js"]
# ENTRYPOINT ["tail", "-f", "/dev/null"]