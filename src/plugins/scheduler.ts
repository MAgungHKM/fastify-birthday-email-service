import fp from "fastify-plugin";
import { fastifySchedule } from "@fastify/schedule";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<any>(
  async (fastify) => {
    fastify.register(fastifySchedule);
  },
  { name: "scheduler" }
);
