import { build } from "../helper";
import { test } from "tap";

test("default root route", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/",
  });

  t.ok(res);
});
