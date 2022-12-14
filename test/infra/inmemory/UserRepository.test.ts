import Fastify from "fastify";
import { DateTime } from "luxon";
import { test } from "tap";
import { IUserRepository, User, UserIDNotFound } from "../../../src/core/users";
import { InMemoryUserRepository } from "../../../src/infra/inmemory";
import { InMemoryDB } from "../../../src/infra/inmemory/db";
import Zones from "../../../src/plugins/zones";

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
  const fastify = Fastify();
  await fastify.register(Zones);

  InMemoryDB.getInstance().users().clearData();

  await fastify.ready();

  const userRepository: IUserRepository = new InMemoryUserRepository(
    fastify.getAllTimeZonesByHour
  );
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
    birthdate: now,
    location: "Australia/Melbourne",
  };

  t.test("create a user", async (t) => {
    const prevData = { ...user1 };
    const error = await userRepository.create(user1);

    t.same(user1, {
      _id: 1,
      ...prevData,
    });
    t.equal(error, undefined);
  });

  t.test("get all user", async (t) => {
    const { users, error } = await userRepository.getAll();
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
    const { user: checkUser1, error } = await userRepository.getById(1);
    t.same(checkUser1, {
      _id: 1,
      ...user1,
    });
    t.equal(error, undefined);
  });

  t.test("get user but with invalid id", async (t) => {
    const { user: checkUser1, error } = await userRepository.getById(-1);
    t.equal(checkUser1, undefined);
    t.same(error, new UserIDNotFound(-1));
  });

  t.test("get user by id but return unknown error", async (t) => {
    const { user: checkUser1, error } = await mockedUserRepository.getById(-1);
    t.equal(checkUser1, undefined);
    t.same(error, { message: "Unknown error" });
  });

  const newUser1: User = {
    _id: 1,
    firstName: "Jeane",
    lastName: "Doe",
    birthdate: now,
    location: "Australia/Melbourne",
  };

  t.test("update a user by their id", async (t) => {
    const { user: updatedUser1, error } = await userRepository.update(newUser1);
    t.same(updatedUser1, {
      _id: 1,
      ...newUser1,
    });
    t.equal(error, undefined);
  });

  t.test("update a user but with invalid id", async (t) => {
    const { user: updatedUser1, error } = await userRepository.update({
      ...newUser1,
      _id: -1,
    });
    t.equal(updatedUser1, undefined);
    t.same(error, new UserIDNotFound(-1));
  });

  t.test("update a user by id but return unknown error", async (t) => {
    const { user: checkUser1, error } = await mockedUserRepository.update(
      newUser1
    );
    t.equal(checkUser1, undefined);
    t.same(error, { message: "Unknown error" });
  });

  t.test("delete user by id", async (t) => {
    const { user: deletedUser, error } = await userRepository.delete(1);
    t.same(deletedUser, {
      _id: 1,
      ...newUser1,
    });
    t.equal(error, undefined);
  });

  t.test("delete user but with invalid id", async (t) => {
    const { user: deletedUser, error } = await userRepository.delete(-1);
    t.equal(deletedUser, undefined);
    t.same(error, new UserIDNotFound(-1));
  });

  t.test("delete a user by id but return unknown error", async (t) => {
    const { user: checkUser1, error } = await mockedUserRepository.delete(-1);
    t.equal(checkUser1, undefined);
    t.same(error, { message: "Unknown error" });
  });

  const newUser2: User = {
    firstName: "Jeane",
    lastName: "Doe",
    birthdate: now,
    location: "Australia/Melbourne",
  };

  const newUser3: User = {
    firstName: "Doe",
    lastName: "Jeane",
    birthdate: now,
    location: "Asia/Jakarta",
  };

  const newUser4: User = {
    firstName: "Johnny",
    lastName: "Doe",
    birthdate: now,
    location: "Australia/Melbourne",
  };

  t.test("get user by location", async (t) => {
    await userRepository.create(newUser2);
    await userRepository.create(newUser3);
    await userRepository.create(newUser4);

    const date = DateTime.now().setZone("Australia/Melbourne");

    const { users, error } = await userRepository.getByLocalTime(date.hour);
    t.equal(Object.keys(users!!).length, 2);
    t.same(users, [
      {
        ...newUser2,
        _id: 2,
      },
      {
        ...newUser4,
        _id: 4,
      },
    ]);
    t.equal(error, undefined);

    const { users: users2 } = await userRepository.getByLocalTime(
      date.setZone("Europe/Amsterdam").hour
    );
    t.equal(Object.keys(users2!!).length, 0);
    t.same(users2, []);
  });

  t.teardown(async () => {
    InMemoryDB.getInstance().users().clearData();
    await fastify.close();
  });
});
