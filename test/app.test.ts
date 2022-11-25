import { test } from "tap";
import { build } from "./helper";
// import FastifySwagger from "@fastify/swagger";
// import FastifySwaggerUI from "@fastify/swagger-ui";
import * as dotenv from "dotenv";
dotenv.config();

test("swagger & swagger-ui is loaded correctly", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/docs/json",
  });

  t.same(JSON.parse(res.payload).info, {
    title: process.env.FASTIFY_NAME,
    version: process.env.npm_package_version,
  });
});
