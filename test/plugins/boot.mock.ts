import fp from "fastify-plugin";
import { IUserRepository, User } from "../../src/core/users";

class MockedInMemoryUserRepository implements IUserRepository {
  create = (_user: User) => {
    return { message: "Unknown error" };
  };
  getAll = () => {
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

export interface BootPluginOptions {
  // Specify Boot plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<BootPluginOptions>(async (fastify, opts) => {
  fastify.decorate("userRepository", new MockedInMemoryUserRepository());
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    userRepository: IUserRepository;
  }
}