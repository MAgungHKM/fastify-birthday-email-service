import { User } from "../../core/users";
import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import { zones } from "tzdata";

const luxonValidTimeZonesArr = [
  ...new Set<string>(
    Object.keys(zones).filter(
      (tz) => tz.includes("/") && DateTime.local().setZone(tz).isValid
    )
  ),
].sort((a, b) => (a < b ? -1 : 1));

export const ERROR_NOT_FOUND = "Not found";

function createRandomUser(location: string): User {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    birthdate: faker.date.birthdate(),
    location,
  };
}

export class InMemoryDB {
  private static instance: InMemoryDB;
  private user = {
    map: Array.from({ length: 10000 }, (_, i) => i).reduce((obj, idx) => {
      obj[idx] = createRandomUser(
        luxonValidTimeZonesArr[
          Math.floor(Math.random() * luxonValidTimeZonesArr.length)
        ]
      );
      return obj;
    }, {} as Record<string, User>),
    lastInsertedId: 1,
  };

  private constructor() {}

  static getInstance(): InMemoryDB {
    if (!InMemoryDB.instance) {
      InMemoryDB.instance = new InMemoryDB();
    }

    return InMemoryDB.instance;
  }

  users = () => ({
    getAll: () => this.user.map,
    getById: (userId: number) => {
      const user = this.user.map[userId];
      if (!user) {
        return { error: ERROR_NOT_FOUND };
      }

      return { user };
    },
    create: (user: User) => {
      const userId = this.user.lastInsertedId++;
      user._id = userId;
      this.user.map[userId] = user;
    },
    update: (user: User) => {
      if (!user._id || !this.user.map[user._id]) {
        return { error: ERROR_NOT_FOUND };
      }

      this.user.map[user._id] = user;

      return { user: this.user.map[user._id] };
    },
    delete: (userId: number) => {
      const user = this.user.map[userId];
      if (!user) {
        return { error: ERROR_NOT_FOUND };
      }

      delete this.user.map[userId];

      return { user };
    },
    clearData: () => {
      this.user.map = {};
      this.user.lastInsertedId = 1;
    },
  });
}
