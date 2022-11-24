import { FastifyPluginAsync } from "fastify";

const location: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    "/",
    {
      schema: {
        operationId: "get-all-location",
        tags: ["Location"],
        summary: "Get all available location for user",
        description: "Get all valid Luxon timezones used for user's location",
      },
    },
    async function (request, reply) {
      return {
        message: "Success",
        data: Object.keys(fastify.getAllValidTimeZones()),
      };
    }
  );
};

export default location;
