import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";
import FastifySwagger from "@fastify/swagger";
import FastifySwaggerUI from "@fastify/swagger-ui";
import Bootstrapper from "./plugins/boot";
import Emailer from "./plugins/emailer";

import * as dotenv from "dotenv";
dotenv.config();

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!
  await fastify.register(FastifySwagger, {
    hideUntagged: true,
  });

  await fastify.register(FastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecification: (swaggerObject) => {
      return {
        ...swaggerObject,
        info: {
          ...swaggerObject.info,
          title: process.env.FASTIFY_NAME,
          version: process.env.npm_package_version,
        },
      };
    },
    transformSpecificationClone: true,
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  await fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });

  await fastify.register(Bootstrapper);
  await fastify.register(Emailer);
};

export default app;
export { app, options };
