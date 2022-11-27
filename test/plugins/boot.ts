import fp from "fastify-plugin";
import { ApiService } from "../../src/api";
import { EmailQueueService } from "../../src/core/emails/queues";
import { IUserRepository, UserService } from "../../src/core/users";
import { InMemoryUserRepository } from "../../src/infra/inmemory";

export interface BootstrapperPluginOptions {
  // Specify Bootstrapper plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<BootstrapperPluginOptions>(
  async (fastify, opts) => {
    const userRepository = new InMemoryUserRepository(
      fastify.getAllTimeZonesByHour
    );
    const userService = new UserService(
      userRepository,
      fastify.getAllTimeZonesByHour
    );

    const emailQueueService = new EmailQueueService(
      userRepository,
      userService,
      new ApiService(process.env.EMAIL_SERVICE_URL)
    );

    fastify.decorate("userRepository", userRepository);
    fastify.decorate("userService", userService);
    fastify.decorate("emailQueueService", emailQueueService);
  },
  {
    name: "bootstrapper",
    dependencies: ["zones"],
  }
);

export const autoload = false;

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    userRepository: IUserRepository;
    userService: UserService;
    emailQueueService: EmailQueueService;
  }
}
