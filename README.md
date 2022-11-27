# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)

This project was bootstrapped with Fastify-CLI.

# What Is This

This project was intended to be a simple implementation of Domain Driven Design according to my knowladge which I learned from [Dicky Arinal](https://github.com/arinal)——albeit an inconsiderable amount. As described in the first part of this `README`, this project is built with [Fastify](https://www.fastify.io/) framework with [node-tap](https://node-tap.org/) as its test framework. [Prisma](https://www.prisma.io/) is also used as its ORM. [PostgreSQL](https://www.postgresql.org/) is the preferred DB of choice, other than having in memory as well for testing purposes. [Swagger 2.0](https://github.com/fastify/fastify-swagger) is used to generate the API docs.

## Initial setup

### Local
1. Copy or move the `.env.example` to `.env` and update the value as necessary
2. Install the packages using your package installer of choice (I uses pnpm, hence the project [`lock file`](./pnpm-lock.yaml)) by running the following code
    ```
    pnpm install
    ```
3. To run the app as is, you need to make sure your db is set up properly, and the [`db.sql`](./db/db.sql) file in [`db`](./db) directory is imported to your db. If you don't want to use the db you can replace the injected repository to use in memory at [`src/plugins/boot.ts`](./src/plugins/boot.ts#L15) file.
4. You can access the api at [http://localhost:11111](http://localhost:11111).

### Docker
1. Copy or move the `.env.example` to `.env` and update the value as necessary
2. Run the following command to start the docker containers
    ````
    docker-compose up
    ````
3. You can access the db at port `5432` of your localhost and the api at [http://localhost:3000](http://localhost:3000)

## Available Scripts

In the project directory, you can run (you can run this with `npm` as well):

### `pnpm dev`

To start the app in dev mode.\
Open [http://localhost:11111](http://localhost:11111) to view it in the browser.

### `pnpm start`

For production mode

### `pnpm test`

Run the test cases.

### `pnpm test:report`

Run the test cases and generate coverage report while also opening in at your browser.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
