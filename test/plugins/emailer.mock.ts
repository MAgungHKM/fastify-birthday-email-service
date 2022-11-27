import fp from "fastify-plugin";
import { EmailQueue } from "../../src/core/emails/queues";

export interface EmailerPluginOptions {
  // Specify Emailer plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<EmailerPluginOptions>(
  async (fastify, opts) => {
    const emailQueue = new EmailQueue();

    const onTick = async () => {
      try {
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
      } catch (err) {
        console.log(
          "====================================================================================="
        );
        console.log("A problem occured while executing emailer task:", err);
        console.log(
          "====================================================================================="
        );
      }
    };

    const name = "emailer-job";

    fastify.cron.createJob({
      name,
      onTick,
      cronTime: "0 * * * *",
      startWhenReady: true,
      runOnInit: true,
    });

    fastify.ready().then(() => {
      setTimeout(() => {
        fastify.cron.stopAllJobs();
      }, 5000);
    });
  },
  {
    name: "emailer",
    dependencies: ["cron"],
  }
);
