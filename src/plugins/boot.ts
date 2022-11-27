import fp from "fastify-plugin";
import { ApiService } from "../api";
import { EmailQueueService } from "../core/emails/queues/service";
import { IUserRepository, UserService } from "../core/users";
import { PgSQLUserRepository } from "../infra/pgsql";

export interface BootstrapperPluginOptions {
  // Specify Bootstrapper plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<BootstrapperPluginOptions>(
  async (fastify, opts) => {
    // const userRepository = new InMemoryUserRepository(fastify.getAllTimeZonesByHour);
    const userRepository = new PgSQLUserRepository(fastify.prisma);
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
