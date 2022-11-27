import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

export interface PrismaPluginOptions {
  // Specify Boot plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<PrismaPluginOptions>(
  async (server, options) => {
    const prisma = new PrismaClient();

    await prisma.$connect();

    // Make Prisma Client available through the fastify server instance: server.prisma
    server.decorate("prisma", prisma);

    server.addHook("onClose", async (server) => {
      await server.prisma.$disconnect();
    });
  },
  { name: "prisma" }
);

// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module "fastify" {
  export interface FastifyInstance {
    prisma: PrismaClient;
  }
}
