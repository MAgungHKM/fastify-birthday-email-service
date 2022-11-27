import { test } from "tap";
import { Email } from "../../../../src/core/emails";
import {
  EmailQueue,
  EmailQueueItem,
  EmptyEmailQueueError,
} from "../../../../src/core/emails/queues";
import { User } from "../../../../src/core/users";

test("check emailQueue model", async (t) => {
  const now = new Date();

  const user: User = {
    _id: 1,
    firstName: "John",
    lastName: "Doe",
    birthdate: now,
    location: "Asia/Japan",
  };

  const email = new Email(user);
  const emailQueueItem = new EmailQueueItem(email);
  t.test("check emailQueueItem", async (t) => {
    t.same(emailQueueItem.email, {
      to: email.to,
      message: email.message,
      title: email.title,
      userId: 1,
    });
    t.equal(emailQueueItem.retries, 0);
  });

  const emailQueue = new EmailQueue();

  t.test("check emailQueue initial length", async (t) => {
    t.equal(emailQueue.onGoing.length, 0);
    t.equal(emailQueue.failed.length, 0);
  });

  t.test("check poshOnGoing of emailQUeue", async (t) => {
    emailQueue.pushOnGoing(emailQueueItem);

    t.equal(emailQueue.onGoing.length, 1);
  });

  t.test(
    "check shiftOnGoing emailQueue, emailQueueItem incrementRetries & resetRetries",
    async (t) => {
      const { item, error } = emailQueue.shiftOnGoing();
      t.equal(error, undefined);
      t.equal(emailQueue.onGoing.length, 0);
      t.same(item, emailQueueItem);

      item?.incrementRetries();
      t.equal(item?.retries, 1);
      item?.resetRetries();
      t.equal(item?.retries, 0);

      t.test("check poshOnFailed of emailQUeue", async (t) => {
        emailQueue.pushFailed(item!!);

        t.equal(emailQueue.failed.length, 1);
      });
    }
  );

  t.test("check shiftFailed emailQueue", async (t) => {
    const { item, error } = emailQueue.shiftFailed();
    t.equal(error, undefined);
    t.equal(emailQueue.failed.length, 0);
    t.same(item, emailQueueItem);
  });

  t.test("check shiftOnGoing of emailQueue when empty", async (t) => {
    const { item, error } = emailQueue.shiftOnGoing();
    t.same(error, new EmptyEmailQueueError());
    t.equal(item, undefined);
  });

  t.test("check shiftFailed of emailQueue when empty", async (t) => {
    const { item, error } = emailQueue.shiftFailed();
    t.same(error, new EmptyEmailQueueError());
    t.equal(item, undefined);
  });
});

test("check message of EmptyEmailQueueError error", async (t) => {
  const error = new EmptyEmailQueueError();

  t.equal(error.message, `Email queue is empty.`);
});
