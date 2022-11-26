import fp from "fastify-plugin";
import { SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { EmailQueue } from "../core/emails/queues";

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

export const autoload = false;

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(
  async (fastify, opts) => {
    const emailQueue = new EmailQueue();
    fastify.decorate("emailQueue", emailQueue);
    fastify.decorate("stopEmailerJob", () =>
      fastify.scheduler.stopById("emailer-job")
    );

    const task = new AsyncTask(
      "emailing task",
      async () => {
        console.log(
          "====================================================================================="
        );
        console.log("Initiating scheduled emailer job");
        console.log(
          `Queue status: ${emailQueue.onGoing.length} on going, ${emailQueue.failed.length} failed.`
        );
        console.log(
          "====================================================================================="
        );

        console.log("Populating on going queue");
        const errorPopulate =
          await fastify.emailQueueService.populateOnGoingQueue(emailQueue);

        if (errorPopulate) throw errorPopulate;

        console.log(
          `Queue status: ${emailQueue.onGoing.length} on going, ${emailQueue.failed.length} failed.`
        );

        console.log("Processing on going queue");
        const errorProcess =
          await fastify.emailQueueService.processOnGoingQueue(emailQueue);

        if (errorProcess) throw errorProcess;

        console.log(
          "====================================================================================="
        );
        console.log("Emailer job successfully finished");
        console.log(
          `Queue status: ${emailQueue.onGoing.length} on going, ${emailQueue.failed.length} failed.`
        );
        console.log(
          "====================================================================================="
        );
        return Promise.resolve();
      },
      (err) => {
        console.log(
          "====================================================================================="
        );
        console.log("A problem occured while executing emailer task:", err);
        console.log(
          "====================================================================================="
        );
      }
    );

    const job = new SimpleIntervalJob({ hours: 1 }, task, {
      id: "emailer-job",
    });

    fastify.ready().then(() => {
      // initial execute
      task.execute();

      fastify.scheduler.addSimpleIntervalJob(job);
    });
  },
  {
    name: "emailer",
    dependencies: ["scheduler"],
  }
);

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    emailQueue: EmailQueue;
    stopEmailerJob: () => void;
  }
}
