export type User = {
  _id?: number;
  firstName: string;
  lastName: string;
  birthday: Date;
  location: string;
};

export type UserError = {
  message: string;
};

export class UserNotFound implements UserError {
  message: string;

  constructor(userId: number) {
    this.message = `User #${userId} not found.`;
  }
}
