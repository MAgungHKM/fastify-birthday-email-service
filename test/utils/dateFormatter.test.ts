import { test } from "tap";
import { dateAsYYYYMMDD } from "../../src/utils";

test("support works standalone", async (t) => {
  const date = new Date();

  t.equal(
    dateAsYYYYMMDD(date),
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  );
});
