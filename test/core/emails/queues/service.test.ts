import { DateTime, HourNumbers } from "luxon";
import { test } from "tap";
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
} from "../../../../src/core/users";
import { InMemoryUserRepository } from "../../../../src/infra/inmemory";
import { InMemoryDB } from "../../../../src/infra/inmemory/db";
import { dateAsYYYYMMDD } from "../../../../src/utils";

const mockedGetAllTimeZonesByHour = (
  _hour: HourNumbers,
  _date: DateTime | undefined
) => ({
  "Asia/Japan": dateAsYYYYMMDD(new Date()),
  "Australia/Melbourne": dateAsYYYYMMDD(new Date()),
});

class MockedApiService1 {
  getToken = () => {
    return Promise.reject({ message: "Unknown error" });
  };
}

class MockedApiService2 {
  getToken = () => {
    return Promise.resolve({ data: { access_token: 12345 } });
  };

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
  const emailQueueService = new EmailQueueService(userRepository);

  const now = new Date();

  const user1: User = {
    firstName: "John",
    lastName: "Doe",
    birthdate: now,
    location: "Asia/Japan",
  };

  const user2: User = {
    firstName: "Jeanne",
    lastName: "Doe",
    birthdate: now,
    location: "Australia/Melbourne",
  };

  const user3: User = {
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
          return { message: "Unknown error" };
        };
        getAll = () => {
          return { error: { message: "Unknown error" } };
        };
        getByLocalTime = (_hour: HourNumbers) => {
          return { error: { message: "Unknown error" } };
        };
        getById = (_userId: number) => {
          return { error: { message: "Unknown error" } };
        };
        update = (_user: User) => {
          return { error: { message: "Unknown error" } };
        };
        delete = (_userId: number) => {
          return { error: { message: "Unknown error" } };
        };
      }

      const userRepository = new MockedInMemoryUserRepository();
      const emailQueueService = new EmailQueueService(userRepository);
      const error = emailQueueService.populateOnGoingQueue(emailQueue);
      t.same(error, new UserNotFound());
      t.equal(emailQueue.onGoing.length, 0);
    }
  );

  userRepository.create(user1);
  userRepository.create(user2);
  userRepository.create(user3);

  t.test("if able to populate onGoingQueue as intended", async (t) => {
    t.equal(emailQueue.onGoing.length, 0);
    const error = emailQueueService.populateOnGoingQueue(emailQueue);
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

    const { EmailQueueService: MockedEmailQueueService1 } = t.mock(
      "../../../../src/core/emails/queues/service",
      {
        "../../../../src/api": {
          ApiService: MockedApiService1,
        },
      }
    );

    const emailQueueService1 = new MockedEmailQueueService1();
    const error1 = await emailQueueService1.processOnGoingQueue(emailQueue);
    t.same(error1, { message: "Unknown error" });

    const { EmailQueueService: MockedEmailQueueService2 } = t.mock(
      "../../../../src/core/emails/queues/service",
      {
        "../../../../src/api": {
          ApiService: MockedApiService2,
        },
      }
    );

    const emailQueueService2 = new MockedEmailQueueService2();
    const error2 = await emailQueueService2.processOnGoingQueue(emailQueue);
    t.equal(error2, undefined);
  });

  t.teardown(async () => {
    InMemoryDB.getInstance().users().clearData();
  });
});
