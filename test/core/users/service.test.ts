import { DateTime, HourNumbers } from "luxon";
import { test } from "tap";
import { User, UserService } from "../../../src/core/users";
import { InMemoryUserRepository } from "../../../src/infra/inmemory";
import { dateAsYYYYMMDD } from "../../../src/utils";

const now = new Date();

const mockedGetAllTimeZonesByHour = (
  _hour: HourNumbers,
  _date: DateTime | undefined
) => ({
  "Asia/Japan": dateAsYYYYMMDD(now),
  "Australia/Melbourne": dateAsYYYYMMDD(now),
});

test("test userService", async (t) => {
  const userRepository = new InMemoryUserRepository(
    mockedGetAllTimeZonesByHour
  );
  const userService = new UserService(
    userRepository,
    mockedGetAllTimeZonesByHour
  );

  const user: User = {
    _id: 1,
    firstName: "Doee",
    lastName: "Joon",
    location: "Asia/Japan",
    birthdate: now,
  };

  await userRepository.create(user);

  t.test("if working as intended", async (t) => {
    const isBirthday1 = await userService.isUserBirthDayById(
      user._id as number,
      DateTime.fromJSDate(now).setZone(user.location).hour
    );
    t.equal(isBirthday1, true);

    const isBirthday2 = await userService.isUserBirthDayById(
      -1,
      DateTime.fromJSDate(now).setZone(user.location).hour
    );
    t.equal(isBirthday2, false);
  });
});
