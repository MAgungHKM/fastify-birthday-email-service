import { GenericError } from "../../common";

export type User = {
  _id?: number;
  firstName: string;
  lastName: string;
  birthdate: Date;
  location: string;
};

export class UserNotFound implements GenericError {
  message: string;

  constructor() {
    this.message = `There aren't any user.`;
  }
}

export class UserIDNotFound implements GenericError {
  message: string;

  constructor(userId: number) {
    this.message = `User #${userId} not found.`;
  }
}
