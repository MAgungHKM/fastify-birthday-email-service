import fp from "fastify-plugin";
import { EmailQueueService } from "../core/emails/queues/service";
import { IUserRepository } from "../core/users";
import { InMemoryUserRepository } from "../infra/inmemory";

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

    const emailQueueService = new EmailQueueService(userRepository);

    fastify.decorate("userRepository", userRepository);
    fastify.decorate("emailQueueService", emailQueueService);
  },
  { name: "bootstrapper", dependencies: ["zones"] }
);

export const autoload = false;

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    userRepository: IUserRepository;
    emailQueueService: EmailQueueService;
  }
}
