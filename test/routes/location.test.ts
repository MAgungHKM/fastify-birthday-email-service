import { test } from "tap";
import { DateTime } from "luxon";
import { zones } from "tzdata";
import Fastify from "fastify";
import fp from "fastify-plugin";
import MockedEmailer from "../plugins/emailer.mock";

test("location is loaded and verified", async (t) => {
  const luxonValidTimeZonesArr = [
    ...new Set<string>(
      Object.keys(zones).filter(
        (tz) => tz.includes("/") && DateTime.local().setZone(tz).isValid
      )
    ),
  ].sort((a, b) => (a < b ? -1 : 1));

  const AppMock = t.mock("../../src/app", {
    "../../src/plugins/emailer": MockedEmailer,
  });
  const mockedApp = Fastify();
  mockedApp.register(fp(AppMock), {});

  const res = await mockedApp.inject({
    url: "/location",
  });

  t.same(JSON.parse(res.payload), {
    message: "Success",
    data: luxonValidTimeZonesArr,
  });

  t.teardown(async () => await mockedApp.close());
});
