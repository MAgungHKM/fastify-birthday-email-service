import { IUserRepository, User, UserIDNotFound } from "../../core/users";
import { HourNumbers } from "luxon";
import type { Prisma, PrismaClient, users as UserModel } from "@prisma/client";

export class PgSQLUserRepository implements IUserRepository {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  private mapUserModelToUser = (user: UserModel): User => ({
    _id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    location: user.location,
    birthdate: user.birthdate,
  });

  private mapUserToUserModelCreate = (user: User): Prisma.usersCreateInput => ({
    first_name: user.firstName,
    last_name: user.lastName,
    location: user.location,
    birthdate: user.birthdate,
  });

  private mapUserModelsToUsers = (users: UserModel[]): User[] =>
    users.map((user) => ({
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      location: user.location,
      birthdate: user.birthdate,
    }));

  getAll = async () => {
    const userModels = await this.db.users.findMany();
    const users = this.mapUserModelsToUsers(userModels);

    return { users };
  };

  getById = async (id: number) => {
    const userModel = await this.db.users.findFirst({ where: { id } });
    if (!userModel) {
      return { error: new UserIDNotFound(id) };
    }

    const user = this.mapUserModelToUser(userModel);

    return { user };
  };

  getByLocalTime = async (hour: HourNumbers) => {
    const userModels = (await this.db.$queryRaw`SELECT * FROM users u 
      WHERE EXTRACT(HOUR FROM NOW() AT TIME ZONE u.location) = ${hour}
      AND TO_CHAR(u.birthdate::TIMESTAMP, 'MM-DD') = TO_CHAR(NOW(), 'MM-DD')`) as UserModel[];

    const users = this.mapUserModelsToUsers(userModels);
    return { users };
  };

  create = async (user: User) => {
    const createdUserModel = await this.db.users.create({
      data: this.mapUserToUserModelCreate(user),
    });

    user._id = createdUserModel.id;

    return undefined;
  };

  update = async (user: User) => {
    const id = user._id as number;
    const checkUser = await this.db.users.findFirst({ where: { id } });

    if (!checkUser) {
      return { error: new UserIDNotFound(id) };
    }

    const updatedUserModel = await this.db.users.update({
      where: { id },
      data: this.mapUserToUserModelCreate(user),
    });
    const updatedUser = this.mapUserModelToUser(updatedUserModel);

    user._id = updatedUser._id;
    user.firstName = updatedUser.firstName;
    user.lastName = updatedUser.lastName;
    user.location = updatedUser.location;
    user.birthdate = updatedUser.birthdate;

    return { user: updatedUser };
  };

  delete = async (id: number) => {
    const checkUser = await this.db.users.findFirst({ where: { id } });

    if (!checkUser) {
      return { error: new UserIDNotFound(id) };
    }

    const deletedUser = await this.db.users.delete({ where: { id } });
    const user = this.mapUserModelToUser(deletedUser);

    return { user };
  };
}
