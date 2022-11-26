import { test } from "tap";
import {
  Email,
  EmailServerError,
  EmailTimeoutError,
} from "../../../src/core/emails";
import { User } from "../../../src/core/users";

test("check email model", async (t) => {
  const now = new Date();

  const user: User = {
    firstName: "John",
    lastName: "Doe",
    birthdate: now,
    location: "Asia/Japan",
  };

  const fullName = `${user.firstName} ${user.lastName}`;
  const cleanLowerCaseFullName = fullName
    .toLowerCase()
    .replace(" ", ".")
    .replaceAll(/[^a-z]+/g, "");

  const to = `${cleanLowerCaseFullName}@mail.test`;
  const title = `Happy birthday, ${user.firstName}!`;
  const message = `Hey, ${fullName} it's your birthday!`;

  const email = new Email(user);
  t.equal(email.message, message);
  t.equal(email.to, to);
  t.equal(email.title, title);
});

test("check message of EmailServerError error", async (t) => {
  const to = "test@mail.co";
  const error = new EmailServerError(to);

  t.equal(error.message, `A problem occured when sending email to ${to}`);
});

test("check message of EmailTimeoutError error", async (t) => {
  const to = "test@mail.co";
  const error = new EmailTimeoutError(to);

  t.equal(
    error.message,
    `The request took too long to complete when sending email to ${to}`
  );
});
