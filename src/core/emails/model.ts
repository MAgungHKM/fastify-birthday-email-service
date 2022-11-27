import { GenericError } from "../../common";
import { User } from "../users";

export class Email {
  to: string;
  title: string;
  message: string;
  userId: number;

  constructor(user: User) {
    const fullName = `${user.firstName} ${user.lastName}`;
    const cleanLowerCaseFullName = fullName
      .toLowerCase()
      .replace(" ", ".")
      .replaceAll(/[^a-z]+/g, "");

    this.to = `${cleanLowerCaseFullName}@mail.test`;
    this.title = `Happy birthday, ${user.firstName}!`;
    this.message = `Hey, ${fullName} it's your birthday!`;
    this.userId = user._id as number;
  }
}

export class EmailServerError implements GenericError {
  message: string;

  constructor(to: string) {
    this.message = `A problem occured when sending email to ${to}`;
  }
}

export class EmailTimeoutError implements GenericError {
  message: string;

  constructor(to: string) {
    this.message = `The request took too long to complete when sending email to ${to}`;
  }
}
