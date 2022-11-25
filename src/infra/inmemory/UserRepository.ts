import { ERROR_NOT_FOUND, InMemoryDB } from "./db";
import { IUserRepository, User, UserNotFound } from "../../core/users";

export class InMemoryUserRepository implements IUserRepository {
  db = InMemoryDB.getInstance();

  getAll = () => {
    const users = Object.values(this.db.users().getAll());

    return { users };
  };

  getById = (userId: number) => {
    const { user, error } = this.db.users().getById(userId);
    if (error) {
      if (error === ERROR_NOT_FOUND) return { error: new UserNotFound(userId) };
      else return { error: { message: error } };
    }

    return { user };
  };

  create = (user: User) => {
    this.db.users().create(user);

    return undefined;
  };

  update = (user: User) => {
    const { user: updatedUser, error } = this.db.users().update(user);
    if (error) {
      if (error === ERROR_NOT_FOUND && user._id)
        return { error: new UserNotFound(user._id) };
      else return { error: { message: error } };
    }

    return { user: updatedUser };
  };

  delete = (userId: number) => {
    const { user, error } = this.db.users().delete(userId);
    if (error) {
      if (error === ERROR_NOT_FOUND) return { error: new UserNotFound(userId) };
      else return { error: { message: error } };
    }

    return { user };
  };
}
