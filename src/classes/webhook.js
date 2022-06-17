const { WebhookClient, MessageEmbed } = require("discord.js");

class MonitorWebhook extends WebhookClient {
  constructor(id_key_obj, data) {
    super(id_key_obj);
    this._site = data.site;
    this._hash = data.hash;
    this._akamaiURL = data.akamaiURL;
    this._topIdentifier = data.topIdentifier;
  }
  get site() {
    return this._site;
  }
  get hash() {
    return this._hash;
  }
  get akamaiURL() {
    return this._akamaiURL;
  }
  get topIdentifier() {
    return this._topIdentifier;
  }
  /**
   * Sends the message to the webhook
   */
  sendMessage = () => {
    this.send(this.buildEmbed());
  };
  /**
   * Builds an embed for the webhook message.
   * The embed includes important information like:
   *
   * 1. The target host URL,
   * 2. the top identifier name,
   * 3. the script hash,
   * 4. the script url,
   * 5. and time of detection.
   *
   * @returns The embed
   */
  buildEmbed = () => {
    let embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(`Script Update Detected: ${this.site}`)
      .setURL(`https://${this.site}`)
      .setAuthor({
        name: "Akamai Script Monitor",
        iconURL:
          "https://pbs.twimg.com/profile_images/1458127684379291652/2nWEKc2r_400x400.jpg",
        url: "https://github.com/SteakEnthusiast/Akamai-Script-Monitor/",
      })
      .setDescription(
        `An akamai script update was detected for your target site: ${this.site}`
      )
      .addFields(
        { name: "Top Identifier Name", value: this.topIdentifier },
        { name: "Script Hash", value: this.hash },
        { name: "Script URL", value: this.akamaiURL }
      )
      .setTimestamp()
      .setFooter({
        text: "Time of Detection:",
        iconURL:
          "https://pbs.twimg.com/profile_images/1458127684379291652/2nWEKc2r_400x400.jpg",
      });
    return { embeds: [embed] };
  };
}

module.exports = {
  MonitorWebhook: MonitorWebhook,
};
