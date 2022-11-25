import { test } from "tap";
import { dateAsYYYYMMDD } from "../../src/utils";

test("support works standalone", async (t) => {
  const date = new Date();

  t.equal(
    dateAsYYYYMMDD(date),
    `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
  );
});
