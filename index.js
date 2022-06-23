const { monitor } = require("./src/monitor");
const { readFileSync } = require("fs");
/**
 * The entry function of the program
 * Parse the config.json file and check for errors.
 * More error checking can probably be added, but this works for my use case.
 * The program will exit if there are any errors, but will continue if there are non-fatal warnings.
 * If there are no errors, we start up the monitor.
 */
async function main() {
  const config = JSON.parse(readFileSync("./config/config.json"));
  let delay = config.delay;
  const webhookData = config.webhook;
  let urls = [];
  let errors = [];
  let warnings = [];

  // Webhook Errors

  if (!webhookData.id) {
    errors.push("Missing webhook id");
  }
  if (!webhookData.token) {
    errors.push("Missing webhook token");
  }
  // Site Errors
  for (const site of config.sites) {
    urls.push(site.url);
  }

  if (!urls) {
    errors.push(
      "You haven't added any sites to monitor. Please add site URLs into config.json"
    );
    return;
  }

  // Warnings

  if (typeof delay == "undefined" || delay < 0) {
    warnings.push(
      "Invalid delay specified. Make sure you've entered a valid delay into config.json. Valid delays must be above at least 1ms. \nStarting with default delay of 5000ms..."
    );
    delay = 5000;
  }

  // Print Errors
  if (errors.length > 1) {
    console.log(`[Fatal]: Detected ${errors.length} errors:`);
    for (const err of errors) {
      console.log("Error:", err);
    }
    //Exit the program if any errors
    return;
  }
  // Print Warnings
  if (warnings.length > 1) {
    console.log(`[WARNING]: Detected ${warnings.length} warnings:`);
    for (const err of errors) {
      console.log("Warning:", err);
    }
  }

  // Start the monitor
  monitor(urls, delay, webhookData);
}

main();
