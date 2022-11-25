import { test } from "tap";
import { UserNotFound } from "../../../src/core/users";

test("check message of UserNotFound error", async (t) => {
  const userId = 5;
  const error = new UserNotFound(userId);

  t.equal(error.message, `User #${userId} not found.`);
});
