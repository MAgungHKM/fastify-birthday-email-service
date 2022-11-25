import { User } from "../../core/users";

export const ERROR_NOT_FOUND = "Not found";

export class InMemoryDB {
  private static instance: InMemoryDB;
  private user = {
    map: {} as Record<number, User>,
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
