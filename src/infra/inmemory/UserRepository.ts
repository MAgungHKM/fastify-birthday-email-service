import { ERROR_NOT_FOUND, InMemoryDB } from "./db";
import { IUserRepository, User, UserIDNotFound } from "../../core/users";
import { DateTime, HourNumbers } from "luxon";
import { dateAsYYYYMMDD } from "../../utils";

export class InMemoryUserRepository implements IUserRepository {
  private db = InMemoryDB.getInstance();
  private getAllTimeZonesByHour: (
    hour: HourNumbers,
    date?: DateTime
  ) => Record<string, string>;

  constructor(
    getAllTimeZonesByHour: (
      hour: HourNumbers,
      date?: DateTime
    ) => Record<string, string>
  ) {
    this.getAllTimeZonesByHour = getAllTimeZonesByHour;
  }

  getAll = () => {
    const users = Object.values(this.db.users().getAll());

    return { users };
  };

  getById = (userId: number) => {
    const { user, error } = this.db.users().getById(userId);
    if (error) {
      if (error === ERROR_NOT_FOUND)
        return { error: new UserIDNotFound(userId) };
      else return { error: { message: error } };
    }

    return { user };
  };

  getByLocalTime = (hour: HourNumbers) => {
    const zones = this.getAllTimeZonesByHour(hour);
    return {
      users: Object.values(this.db.users().getAll()).filter(
        (user) =>
          Object.keys(zones).includes(user.location) &&
          dateAsYYYYMMDD(user.birthdate).slice(5) ===
            zones[user.location].slice(5)
      ),
    };
  };

  create = (user: User) => {
    this.db.users().create(user);

    return undefined;
  };

  update = (user: User) => {
    const { user: updatedUser, error } = this.db.users().update(user);
    if (error) {
      if (error === ERROR_NOT_FOUND && user._id)
        return { error: new UserIDNotFound(user._id) };
      else return { error: { message: error } };
    }

    return { user: updatedUser };
  };

  delete = (userId: number) => {
    const { user, error } = this.db.users().delete(userId);
    if (error) {
      if (error === ERROR_NOT_FOUND)
        return { error: new UserIDNotFound(userId) };
      else return { error: { message: error } };
    }

    return { user };
  };
}
