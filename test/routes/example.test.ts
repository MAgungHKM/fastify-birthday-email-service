import { build } from "../helper";
import { test } from "tap";

test("example is loaded", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/example",
  });

  t.equal(res.payload, "this is an example");
});
