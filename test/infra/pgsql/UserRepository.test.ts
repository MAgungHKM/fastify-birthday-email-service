import Fastify from "fastify";
import { DateTime, HourNumbers } from "luxon";
import { test } from "tap";
import { IUserRepository, User, UserIDNotFound } from "../../../src/core/users";
import { PgSQLUserRepository } from "../../../src/infra/pgsql";
import type { Prisma, users as UserModel } from "@prisma/client";
import { zones } from "tzdata";
import { dateAsYYYYMMDD } from "../../../src/utils";

const luxonValidTimeZonesArr = [
  ...new Set<string>(
    Object.keys(zones).filter(
      (tz) => tz.includes("/") && DateTime.local().setZone(tz).isValid
    )
  ),
].sort((a, b) => (a < b ? -1 : 1));

const getAllTimeZonesByHour = (
  hour: HourNumbers,
  date: DateTime = DateTime.local()
) => {
  const validTimeZones: Record<string, string> = {};

  for (const timeZone of luxonValidTimeZonesArr) {
    const zoneHour = date.setZone(timeZone).hour;

    if (zoneHour === hour) {
      validTimeZones[timeZone] = date.toFormat("yyyy-MM-dd");
    }
  }

  return validTimeZones;
};

class MockedPrismaClient {
  db = {
    users: {
      data: {} as Record<string, UserModel>,
      lastInsertedId: 0,
    },
  };

  $connect = () => Promise.resolve();
  $disconnect = () => {
    this.db.users.data = {};
    this.db.users.lastInsertedId = 0;

    return Promise.resolve();
  };
  $queryRaw = async (
    _query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ) => {
    const [hour] = values;

    const zones = getAllTimeZonesByHour(Number(hour) as HourNumbers);

    const users = (await this.users.findMany()).filter(
      (user) =>
        Object.keys(zones).includes(user.location) &&
        dateAsYYYYMMDD(user.birthdate).slice(5) ===
          zones[user.location].slice(5)
    );

    return Promise.resolve(users);
  };

  users = {
    findMany: () => {
      return Promise.resolve(Object.values(this.db.users.data));
    },
    findFirst: (args: Prisma.usersFindFirstArgsBase) => {
      return Promise.resolve(
        this.db.users.data[(args.where as Prisma.usersWhereInput).id as string]
      );
    },
    create: (args: Prisma.usersCreateArgs) => {
      const id = ++this.db.users.lastInsertedId;
      const user: UserModel = {
        id,
        first_name: args.data.first_name,
        last_name: args.data.last_name,
        location: args.data.location,
        birthdate: args.data.birthdate as Date,
      };

      this.db.users.data[id] = { ...user };

      return Promise.resolve(user);
    },
    update: (args: Prisma.usersUpdateArgs) => {
      const id = args.where.id as number;
      const user: UserModel = {
        id,
        first_name: args.data.first_name as string,
        last_name: args.data.last_name as string,
        location: args.data.location as string,
        birthdate: args.data.birthdate as Date,
      };

      this.db.users.data[id] = { ...user };

      return Promise.resolve(user);
    },
    delete: (args: Prisma.usersDeleteArgs) => {
      const user =
        this.db.users.data[(args.where as Prisma.usersWhereInput).id as number];
      delete this.db.users.data[
        (args.where as Prisma.usersWhereInput).id as number
      ];

      return Promise.resolve(user);
    },
  };
}

test('"postgres" db working as intended', async (t) => {
  const PrismaPlugin = t.mock("../../../src/plugins/prisma", {
    "@prisma/client": {
      PrismaClient: MockedPrismaClient,
    },
  });

  const fastify = Fastify();
  await fastify.register(PrismaPlugin);
  await fastify.ready();

  const userRepository: IUserRepository = new PgSQLUserRepository(
    fastify.prisma
  );

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

    const date = DateTime.fromJSDate(now).setZone("Australia/Melbourne");

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

  t.teardown(async () => await fastify.close());
});
