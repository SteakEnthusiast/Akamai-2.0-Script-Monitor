const { Worker } = require("./classes/Worker");
const { MonitorWebhook } = require("./classes/webhook");
const fs = require("fs");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * The main monitoring function.
 * Creates and runs tasks on a pre-defined interval.
 * @param {Array} sites The target sites' URLs.
 * @param {Integer} delay Time to wait between checks, in milliseconds, config.json.
 * @param {Object} webhookData The webhook id and key, from config.json.
 */
async function monitor(sites, delay, webhookData) {
  const workerPool = [];
  for (site of sites) {
    const worker = new Worker({
      site: site,
    });
    workerPool.push(worker);
  }
  console.log(`Monitor is now running for sites:\n${sites.join("\n")}`);
  while (true) {
    for (const worker of workerPool) {
      const workerResult = await worker.run();
      if (workerResult != null) {
        const webhook = new MonitorWebhook(
          {
            id: webhookData.id,
            token: webhookData.token,
          },
          workerResult
        );
        webhook.sendMessage();
      }
    }
    await sleep(delay);
  }
}

module.exports = {
  monitor: monitor,
};
