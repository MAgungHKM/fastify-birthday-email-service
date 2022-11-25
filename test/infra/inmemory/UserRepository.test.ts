import { test } from "tap";
import { IUserRepository, User, UserNotFound } from "../../../src/core/users";
import { InMemoryUserRepository } from "../../../src/infra/inmemory";
import { InMemoryDB } from "../../../src/infra/inmemory/db";

class MockedInMemoryDB {
  private static instance: MockedInMemoryDB;

  private constructor() {}

  static getInstance(): MockedInMemoryDB {
    if (!MockedInMemoryDB.instance) {
      MockedInMemoryDB.instance = new MockedInMemoryDB();
    }

    return MockedInMemoryDB.instance;
  }

  users = () => ({
    getById: (_userId: number) => {
      return { error: "Unknown error" };
    },
    update: (_user: User) => {
      return { error: "Unknown error" };
    },
    delete: (_userId: number) => {
      return { error: "Unknown error" };
    },
  });
}

test("in memory db working as intended", async (t) => {
  const userRepository: IUserRepository = new InMemoryUserRepository();
  const { InMemoryUserRepository: InMemoryUserRepositoryMock } = t.mock(
    "../../../src/infra/inmemory/UserRepository",
    {
      "../../../src/infra/inmemory/db": {
        InMemoryDB: MockedInMemoryDB,
      },
    }
  );
  const mockedUserRepository = new InMemoryUserRepositoryMock();

  const now = new Date();

  const user1: User = {
    firstName: "John",
    lastName: "Doe",
    birthday: now,
    location: "Australia/Melbourne",
  };

  t.test("create a user", async (t) => {
    const prevData = { ...user1 };
    const error = userRepository.create(user1);

    t.same(user1, {
      _id: 1,
      ...prevData,
    });
    t.equal(error, undefined);
  });

  t.test("get all user", async (t) => {
    const { users, error } = userRepository.getAll();
    t.equal(users?.length, 1);
    t.same(users, [
      {
        ...user1,
        _id: 1,
      },
    ]);
    t.equal(error, undefined);
  });

  t.test("get user by id", async (t) => {
    const { user: checkUser1, error } = userRepository.getById(1);
    t.same(checkUser1, {
      _id: 1,
      ...user1,
    });
    t.equal(error, undefined);
  });

  t.test("get user but with invalid id", async (t) => {
    const { user: checkUser1, error } = userRepository.getById(-1);
    t.equal(checkUser1, undefined);
    t.same(error, new UserNotFound(-1));
  });

  t.test("get user by id but return unknown error", async (t) => {
    const { user: checkUser1, error } = mockedUserRepository.getById(-1);
    t.equal(checkUser1, undefined);
    t.same(error, { message: "Unknown error" });
  });

  const newUser1: User = {
    _id: 1,
    firstName: "Jeane",
    lastName: "Doe",
    birthday: now,
    location: "Australia/Melbourne",
  };

  t.test("update a user by their id", async (t) => {
    const { user: updatedUser1, error } = userRepository.update(newUser1);
    t.same(updatedUser1, {
      _id: 1,
      ...newUser1,
    });
    t.equal(error, undefined);
  });

  t.test("update a user but with invalid id", async (t) => {
    const { user: updatedUser1, error } = userRepository.update({
      ...newUser1,
      _id: -1,
    });
    t.equal(updatedUser1, undefined);
    t.same(error, new UserNotFound(-1));
  });

  t.test("update a user by id but return unknown error", async (t) => {
    const { user: checkUser1, error } = mockedUserRepository.update(newUser1);
    t.equal(checkUser1, undefined);
    t.same(error, { message: "Unknown error" });
  });

  t.test("delete user by id", async (t) => {
    const { user: deletedUser, error } = userRepository.delete(1);
    t.same(deletedUser, {
      _id: 1,
      ...newUser1,
    });
    t.equal(error, undefined);
  });

  t.test("delete user but with invalid id", async (t) => {
    const { user: deletedUser, error } = userRepository.delete(-1);
    t.equal(deletedUser, undefined);
    t.same(error, new UserNotFound(-1));
  });

  t.test("delete a user by id but return unknown error", async (t) => {
    const { user: checkUser1, error } = mockedUserRepository.delete(-1);
    t.equal(checkUser1, undefined);
    t.same(error, { message: "Unknown error" });
  });

  t.teardown(() => InMemoryDB.getInstance().users().clearData());
});