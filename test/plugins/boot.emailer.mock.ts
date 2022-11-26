import fp from "fastify-plugin";
import { Email } from "../../src/core/emails";
import { EmailQueue, EmailQueueItem } from "../../src/core/emails/queues";
import { IUserRepository, UserNotFound } from "../../src/core/users";
import { InMemoryUserRepository } from "../../src/infra/inmemory";

class MockedEmailQueueService {
  userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  populateOnGoingQueue = (emailQueue: EmailQueue) => {
    const { users, error } = this.userRepository.getAll();

    if (error || !users || users.length === 0) {
      return new UserNotFound();
    }

    for (const user of users) {
      const email = new Email(user);
      const emailQueueItem = new EmailQueueItem(email);

      emailQueue.pushOnGoing(emailQueueItem);
    }

    return undefined;
  };

  processOnGoingQueue = (_emailQueue: EmailQueue) => {
    return { message: "Unknown error" };
  };
}

export interface BootPluginOptions {
  // Specify Boot plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<BootPluginOptions>(
  async (fastify, opts) => {
    const userRepository = new InMemoryUserRepository(
      fastify.getAllTimeZonesByHour
    );
    const emailQueueService = new MockedEmailQueueService(userRepository);

    fastify.decorate("userRepository", userRepository);
    fastify.decorate("emailQueueService", emailQueueService);
  },
  { name: "bootstrapper" }
);

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    userRepository: IUserRepository;
  }
}
