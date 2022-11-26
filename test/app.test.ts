import { test } from "tap";
import Fastify from "fastify";
import fp from "fastify-plugin";
import MockedEmailer from "./plugins/emailer.mock";
import * as dotenv from "dotenv";
dotenv.config();

test("swagger & swagger-ui is loaded correctly", async (t) => {
  const AppMock = t.mock("../src/app", {
    "../src/plugins/emailer": MockedEmailer,
  });
  const mockedApp = Fastify();
  mockedApp.register(fp(AppMock), {});

  const res = await mockedApp.inject({
    url: "/docs/json",
  });

  t.same(JSON.parse(res.payload).info, {
    title: process.env.FASTIFY_NAME,
    version: process.env.npm_package_version,
  });

  t.teardown(async () => await mockedApp.close());
});
