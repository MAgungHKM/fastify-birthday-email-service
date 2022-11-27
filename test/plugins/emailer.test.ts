import Fastify from "fastify";
import { test } from "tap";
import Scheduler from "../../src/plugins/scheduler";
import Emailer from "../../src/plugins/emailer";
import Bootstrapper from "../plugins/boot";
import MockedBootstrapper from "../plugins/boot.emailer.mock";
import Zones from "../../src/plugins/zones";
import { InMemoryDB } from "../../src/infra/inmemory/db";

test("ensure scheduler for emailer works properly", async (t) => {
  const fastify = Fastify();
  await fastify.register(Zones);
  await fastify.register(Bootstrapper);

  InMemoryDB.getInstance().users().clearData();

  InMemoryDB.getInstance()
    .users()
    .create({
      firstName: "Johnn",
      lastName: "Dooe",
      location: Object.keys(fastify.getAllTimeZonesByHour(9))[0],
      birthdate: new Date(),
    });

  await fastify.register(Scheduler);
  await fastify.register(Emailer);
  await fastify.ready();

  t.equal(fastify.scheduler.getById("emailer-job").getStatus(), "running");

  await wait(5000);

  fastify.stopEmailerJob();

  t.equal(fastify.scheduler.getById("emailer-job").getStatus(), "stopped");

  t.teardown(async () => await fastify.close());
});

test("ensure scheduler for emailer works when error occured during populating", async (t) => {
  const fastify = Fastify();
  await fastify.register(Zones);
  await fastify.register(Bootstrapper);

  InMemoryDB.getInstance().users().clearData();

  await fastify.register(Scheduler);
  await fastify.register(Emailer);
  await fastify.ready();

  t.equal(fastify.scheduler.getById("emailer-job").getStatus(), "running");

  await wait(5000);

  fastify.stopEmailerJob();

  t.equal(fastify.scheduler.getById("emailer-job").getStatus(), "stopped");

  t.teardown(async () => await fastify.close());
});

test("ensure scheduler for emailer works when error occured during processing", async (t) => {
  const fastify = Fastify();
  await fastify.register(Zones);
  await fastify.register(MockedBootstrapper);

  InMemoryDB.getInstance().users().clearData();

  InMemoryDB.getInstance()
    .users()
    .create({
      firstName: "Johnn",
      lastName: "Dooe",
      location: Object.keys(fastify.getAllTimeZonesByHour(9))[0],
      birthdate: new Date(),
    });

  await fastify.register(Scheduler);
  await fastify.register(Emailer);
  await fastify.ready();

  t.equal(fastify.scheduler.getById("emailer-job").getStatus(), "running");

  await wait(5000);

  fastify.stopEmailerJob();

  t.equal(fastify.scheduler.getById("emailer-job").getStatus(), "stopped");

  t.teardown(async () => await fastify.close());
});

function wait(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
