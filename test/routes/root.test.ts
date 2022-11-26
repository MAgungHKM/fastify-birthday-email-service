import Fastify from "fastify";
import fp from "fastify-plugin";
import { test } from "tap";
import MockedEmailer from "../plugins/emailer.mock";

test("default root route", async (t) => {
  const AppMock = t.mock("../../src/app", {
    "../../src/plugins/emailer": MockedEmailer,
  });
  const mockedApp = Fastify();
  mockedApp.register(fp(AppMock), {});

  const res1 = await mockedApp.inject({
    url: "/",
  });

  t.ok(res1);

  t.teardown(async () => await mockedApp.close());
});
