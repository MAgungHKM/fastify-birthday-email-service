import fp from "fastify-plugin";
import { IUserRepository } from "../core/users";
import { InMemoryUserRepository } from "../infra/inmemory";

export interface BootPluginOptions {
  // Specify Boot plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<BootPluginOptions>(async (fastify, opts) => {
  fastify.decorate("userRepository", new InMemoryUserRepository());
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    userRepository: IUserRepository;
  }
}
