import { test } from "tap";
import { build } from "../helper";
import { DateTime } from "luxon";
import { zones } from "tzdata";

test("location is loaded and verified", async (t) => {
  const luxonValidTimeZonesArr = [
    ...new Set<string>(
      Object.keys(zones).filter(
        (tz) => tz.includes("/") && DateTime.local().setZone(tz).isValid
      )
    ),
  ].sort((a, b) => (a < b ? -1 : 1));

  const app = await build(t);

  const res = await app.inject({
    url: "/location",
  });
  t.same(JSON.parse(res.payload), {
    message: "Success",
    data: luxonValidTimeZonesArr,
  });
});
