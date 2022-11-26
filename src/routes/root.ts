import { FastifyPluginAsync } from "fastify";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    "/",
    {
      schema: undefined,
    },
    async function (request, reply) {
      return reply.redirect("/docs");
    }
  );
};

export default root;
