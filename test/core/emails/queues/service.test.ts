import { DateTime, HourNumbers } from "luxon";
import { test } from "tap";
import { ApiService } from "../../../../src/api";
import { Email } from "../../../../src/core/emails";
import {
  EmailQueue,
  EmailQueueItem,
  EmailQueueService,
  EmptyEmailQueueError,
} from "../../../../src/core/emails/queues";
import {
  IUserRepository,
  User,
  UserNotFound,
  UserService,
} from "../../../../src/core/users";
import { InMemoryUserRepository } from "../../../../src/infra/inmemory";
import { InMemoryDB } from "../../../../src/infra/inmemory/db";
import { dateAsYYYYMMDD } from "../../../../src/utils";
import dotenv from "dotenv";
dotenv.config();

const now = new Date();

const mockedGetAllTimeZonesByHour = (
  _hour: HourNumbers,
  _date: DateTime | undefined
) => ({
  "Asia/Japan": dateAsYYYYMMDD(now),
  "Australia/Melbourne": dateAsYYYYMMDD(now),
});

class MockedApiService {
  sendNotification = (_title: string, _message: string, _token: string) => {
    return Promise.reject({ message: "Unknown error" });
  };
}

class MockedEmailQueue1 {
  onGoing: EmailQueueItem[] = [];
  failed: EmailQueueItem[] = [];

  shiftOnGoing = () => {
    return { error: { message: "Unknown error" } };
  };

  pushOnGoing = (emailQueueItem: EmailQueueItem) => {
    this.onGoing.push(emailQueueItem);
  };

  shiftFailed = () => {
    if (this.failed.length == 0) {
      return { error: new EmptyEmailQueueError() };
    }

    return { item: this.failed.shift() };
  };

  pushFailed = (emailQueueItem: EmailQueueItem) => {
    this.failed.push(emailQueueItem);
  };
}

class MockedEmailQueue2 {
  onGoing: EmailQueueItem[] = [];
  failed: EmailQueueItem[] = [];

  shiftOnGoing = () => {
    return { error: { message: "Unknown error" } };
  };

  pushOnGoing = (emailQueueItem: EmailQueueItem) => {
    return { error: { message: "Unknown error" } };
  };

  shiftFailed = () => {
    return { error: { message: "Unknown error" } };
  };

  pushFailed = (emailQueueItem: EmailQueueItem) => {
    return { error: { message: "Unknown error" } };
  };
}

test("check emailQueueService", async (t) => {
  t.setTimeout(60 * 1000);

  InMemoryDB.getInstance().users().clearData();

  const userRepository = new InMemoryUserRepository(
    mockedGetAllTimeZonesByHour
  );
  const userService = new UserService(
    userRepository,
    mockedGetAllTimeZonesByHour
  );
  const emailQueueService = new EmailQueueService(
    userRepository,
    userService,
    new ApiService(process.env.EMAIL_SERVICE_URL)
  );

  const user1: User = {
    _id: 1,
    firstName: "John",
    lastName: "Doe",
    birthdate: now,
    location: "Asia/Japan",
  };

  const user2: User = {
    _id: 2,
    firstName: "Jeanne",
    lastName: "Doe",
    birthdate: now,
    location: "Australia/Melbourne",
  };

  const user3: User = {
    _id: 3,
    firstName: "Johnny",
    lastName: "Doe",
    birthdate: now,
    location: "Europe/Amsterdam",
  };

  const email1 = new Email(user1);
  const email2 = new Email(user2);

  const emailQueue = new EmailQueue();

  t.test(
    "if able to catch error when populating onGoingQueue if no user exist",
    async (t) => {
      class MockedInMemoryUserRepository implements IUserRepository {
        create = (_user: User) => {
          return Promise.resolve({ message: "Unknown error" });
        };
        getAll = () => {
          return Promise.resolve({ error: { message: "Unknown error" } });
        };
        getByLocalTime = (_hour: HourNumbers) => {
          return Promise.resolve({ error: { message: "Unknown error" } });
        };
        getById = (_userId: number) => {
          return Promise.resolve({ error: { message: "Unknown error" } });
        };
        update = (_user: User) => {
          return Promise.resolve({ error: { message: "Unknown error" } });
        };
        delete = (_userId: number) => {
          return Promise.resolve({ error: { message: "Unknown error" } });
        };
      }

      const userRepository = new MockedInMemoryUserRepository();
      const emailQueueService = new EmailQueueService(
        userRepository,
        userService,
        new ApiService(process.env.EMAIL_SERVICE_URL)
      );
      const error = await emailQueueService.populateOnGoingQueue(emailQueue);
      t.same(error, new UserNotFound());
      t.equal(emailQueue.onGoing.length, 0);
    }
  );

  await userRepository.create(user1);
  await userRepository.create(user2);
  await userRepository.create(user3);

  t.test("if able to populate onGoingQueue as intended", async (t) => {
    t.equal(emailQueue.onGoing.length, 0);
    const error = await emailQueueService.populateOnGoingQueue(emailQueue);
    t.equal(emailQueue.onGoing.length, 2);
    t.equal(error, undefined);
    t.hasStrict(emailQueue.onGoing, [
      {
        email: email1,
        retries: 0,
      },
      {
        email: email2,
        retries: 0,
      },
    ]);
  });

  t.test("if able to process onGoingQueue", async (t) => {
    const error = await emailQueueService.processOnGoingQueue(emailQueue);
    t.equal(error, undefined);
    t.equal(emailQueue.onGoing.length, 0);
  });

  t.test("if able to handle empty queue error", async (t) => {
    const error = await emailQueueService.processOnGoingQueue(emailQueue);
    t.equal(error, undefined);
  });

  t.test("if able to handle unknown error because of emailQueue", async (t) => {
    const emailQueue1 = new MockedEmailQueue1();
    emailQueue1.pushOnGoing(new EmailQueueItem(email1));
    emailQueue1.pushOnGoing(new EmailQueueItem(email2));
    emailQueue1.pushFailed(
      new EmailQueueItem(
        new Email({
          firstName: "Johnny",
          lastName: "Doe",
          birthdate: now,
          location: "Asia/Japan",
        })
      )
    );
    t.equal(emailQueue1.failed.length, 1);
    t.equal(emailQueue1.onGoing.length, 2);

    const error1 = await emailQueueService.processOnGoingQueue(emailQueue1);
    t.same(error1, { message: "Unknown error" });
    t.equal(emailQueue1.failed.length, 0);
    t.equal(emailQueue1.onGoing.length, 3);

    const emailQueue2 = new MockedEmailQueue2();
    const error2 = await emailQueueService.processOnGoingQueue(emailQueue2);
    t.same(error2, { message: "Unknown error" });
  });

  t.test("if able to return axios error", async (t) => {
    const emailQueue = new EmailQueue();
    emailQueue.pushOnGoing(new EmailQueueItem(email1));
    emailQueue.pushOnGoing(new EmailQueueItem(email2));

    const { EmailQueueService: MockedEmailQueueService } = t.mock(
      "../../../../src/core/emails/queues/service",
      {
        "../../../../src/api": {
          ApiService: MockedApiService,
        },
      }
    );

    const emailQueueService = new MockedEmailQueueService(
      userRepository,
      userService,
      new ApiService(process.env.EMAIL_SERVICE_URL)
    );
    const error = await emailQueueService.processOnGoingQueue(emailQueue);
    t.equal(error, undefined);
  });

  t.test("if able to skip user when its changed or deleted", async (t) => {
    InMemoryDB.getInstance().users().clearData();
    const emailQueue = new EmailQueue();

    await userRepository.create(user1);
    await userRepository.create(user2);
    await userRepository.create(user3);

    const errorPopulate = await emailQueueService.populateOnGoingQueue(
      emailQueue
    );
    t.equal(emailQueue.onGoing.length, 2);
    t.equal(errorPopulate, undefined);
    t.hasStrict(emailQueue.onGoing, [
      {
        email: email1,
        retries: 0,
      },
      {
        email: email2,
        retries: 0,
      },
    ]);

    await userRepository.update({
      _id: 2,
      firstName: "Jeanne",
      lastName: "Doe",
      birthdate: now,
      location: "Europe/Amsterdam",
    });

    const errorProcess = await emailQueueService.processOnGoingQueue(
      emailQueue
    );
    t.equal(errorProcess, undefined);
    t.equal(emailQueue.onGoing.length, 0);
  });

  t.teardown(async () => {
    InMemoryDB.getInstance().users().clearData();
  });
});
