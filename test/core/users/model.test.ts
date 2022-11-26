import { test } from "tap";
import { UserIDNotFound, UserNotFound } from "../../../src/core/users";

test("check message of UserNotFound error", async (t) => {
  const userId = 5;
  const error1 = new UserIDNotFound(userId);

  t.equal(error1.message, `User #${userId} not found.`);

  const error2 = new UserNotFound();

  t.equal(error2.message, "There aren't any user.");
});
