import fp from "fastify-plugin";
import FastifyCron, { Config as FastifyCronOptions } from "fastify-cron";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<FastifyCronOptions>(
  async (fastify) => {
    fastify.register(FastifyCron);
  },
  { name: "cron" }
);
