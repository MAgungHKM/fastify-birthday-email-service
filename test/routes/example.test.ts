import Fastify from "fastify";
import fp from "fastify-plugin";
import { test } from "tap";
import MockedEmailer from "../plugins/emailer.mock";

test("example is loaded", async (t) => {
  const AppMock = t.mock("../../src/app", {
    "../../src/plugins/emailer": MockedEmailer,
  });
  const mockedApp = Fastify();
  mockedApp.register(fp(AppMock), {});

  const res = await mockedApp.inject({
    url: "/example",
  });

  t.equal(res.payload, "this is an example");

  t.teardown(async () => await mockedApp.close());
});
