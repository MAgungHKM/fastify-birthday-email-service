import fp from "fastify-plugin";
import { SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { EmailQueue } from "../../src/core/emails/queues";

export interface EmailerPluginOptions {
  // Specify Emailer plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<EmailerPluginOptions>(
  async (fastify, opts) => {
    const emailQueue = new EmailQueue();

    const task = new AsyncTask("emailing task", async () => {
      console.log(
        "====================================================================================="
      );
      console.log("Initiating scheduled emailer job");
      console.log(
        "====================================================================================="
      );

      console.log("Populating on going queue");
      const errorPopulate =
        await fastify.emailQueueService.populateOnGoingQueue(emailQueue);

      if (errorPopulate) throw errorPopulate;

      console.log("Processing on going queue");
      const errorProcess = await fastify.emailQueueService.processOnGoingQueue(
        emailQueue
      );

      if (errorProcess) throw errorProcess;

      console.log(
        "====================================================================================="
      );
      console.log("Emailer job successfully finished");
      console.log(
        "====================================================================================="
      );
      return Promise.resolve();
    });

    const job = new SimpleIntervalJob(
      { seconds: 10, runImmediately: true },
      task,
      { id: "job-1" }
    );

    fastify.ready().then(() => {
      fastify.scheduler.addSimpleIntervalJob(job);

      setTimeout(() => {
        job.stop();
        fastify.scheduler.removeById("job-1");
      }, 5000);
    });
  },
  {
    name: "emailer",
    dependencies: ["scheduler"],
  }
);
