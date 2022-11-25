import { test } from "tap";
import { User } from "../../../src/core/users";
import { InMemoryDB } from "../../../src/infra/inmemory/db";

test("in memory db working as intended", async (t) => {
  const db = InMemoryDB.getInstance();
  const now = new Date();

  const user1: User = {
    firstName: "John",
    lastName: "Doe",
    birthday: now,
    location: "Australia/Melbourne",
  };

  t.test("create a user", async (t) => {
    const prevData = { ...user1 };
    db.users().create(user1);

    t.same(user1, {
      _id: 1,
      ...prevData,
    });
  });

  t.test("check if db is a singleton", async (t) => {
    const db1 = InMemoryDB.getInstance();

    t.same(db1, db);
  });

  t.test("get all user", async (t) => {
    const users = db.users().getAll();
    t.equal(Object.values(users).length, 1);
    t.same(users, {
      "1": {
        ...user1,
        _id: 1,
      },
    });
  });

  t.test("get user by id", async (t) => {
    const { user: checkUser1, error } = db.users().getById(1);
    t.same(checkUser1, {
      _id: 1,
      ...user1,
    });
    t.equal(error, undefined);
  });

  t.test("get user but with invalid id", async (t) => {
    const { user: checkUser1, error } = db.users().getById(-1);
    t.equal(checkUser1, undefined);
    t.equal(error, "Not found");
  });

  const newUser1: User = {
    _id: 1,
    firstName: "Jeane",
    lastName: "Doe",
    birthday: now,
    location: "Australia/Melbourne",
  };

  t.test("update a user by their id", async (t) => {
    const { user: updatedUser1, error } = db.users().update(newUser1);
    t.same(updatedUser1, {
      _id: 1,
      ...newUser1,
    });
    t.equal(error, undefined);
  });

  t.test("update a user but with invalid id", async (t) => {
    const { user: updatedUser1, error } = db
      .users()
      .update({ ...newUser1, _id: -1 });
    t.equal(updatedUser1, undefined);
    t.equal(error, "Not found");
  });

  t.test("delete user by id", async (t) => {
    const { user: deletedUser, error } = db.users().delete(1);
    t.same(deletedUser, {
      _id: 1,
      ...newUser1,
    });
    t.equal(error, undefined);
  });

  t.test("delete user but with invalid id", async (t) => {
    const { user: deletedUser, error } = db.users().delete(-1);
    t.equal(deletedUser, undefined);
    t.equal(error, "Not found");
  });
});
