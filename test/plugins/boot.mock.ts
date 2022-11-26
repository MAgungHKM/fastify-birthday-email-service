import fp from "fastify-plugin";
import { HourNumbers } from "luxon";
import { IUserRepository, User } from "../../src/core/users";

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
