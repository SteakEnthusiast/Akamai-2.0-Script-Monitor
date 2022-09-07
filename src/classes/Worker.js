const axios = require("axios");
const { load } = require("cheerio");
const crypto = require("crypto");
const { mkdir } = require("fs").promises;
const URL = require("url").URL;
var path = require("path");
const { readdirSync, writeFileSync } = require("fs");

/**
 * This class holds all the variables and functions related to retrieving and parsing the contents of the script.
 */
class Worker {
  constructor(data) {
    this._site = data.site;
    this._host = new URL(data.site).host;
    this._delay = data.delay;
    this._scriptHash = "";
    this._akamaiURL = "";
    this.seenHashes = [];
    this.uniqueCount = 0;
    this.scriptsScrapedCount = 0;
    this.makeDirectory();
  }
  get site() {
    return this._site;
  }
  get host() {
    return this._host;
  }
  get scriptHash() {
    return this._scriptHash;
  }
  get akamaiURL() {
    return this._akamaiURL;
  }
  set akamaiURL(url) {
    this._akamaiURL = url;
  }
  set scriptHash(hash) {
    this._scriptHash = hash;
  }

  /**
   * The main worker function for use in monitor.js
   * The return value will be used to construct the webhook.
   * @returns {object} Containing the target hostname, script hash, script URL, and top identifier name.
   */
  run = async () => {
    try {
      let siteData, akamaiURL, scriptBody;
      siteData = await this.siteRequest();
      if (!siteData) return;
      akamaiURL = this.parseAkamaiUrl(siteData);
      if (!akamaiURL) return;
      scriptBody = await this.scriptRequest(akamaiURL);
      if (!scriptBody) return;
      this.scriptHash = this.getScriptHash(scriptBody);
      if (!this.scriptHash) return;

      // Increment number of scripts scraped
      this.scriptsScrapedCount++;
      const isNewHash = this.isNewHash(this.scriptHash);

      // Print out statistics

      console.log(
        `${this.uniqueCount} out of ${this.scriptsScrapedCount} scripts scraped this session were unique.`
      );

      if (isNewHash) {
        let topIdentifier = this.getTopIdentifier(scriptBody);
        this.saveScriptToDisk(scriptBody, topIdentifier);
        return {
          site: this.host,
          hash: this.scriptHash,
          akamaiURL: this.akamaiURL,
          topIdentifier: topIdentifier,
        };
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  /**
   * Creates the directory for the worker.
   */
  makeDirectory = async () => {
    // If directory doesn't already exist, make it
    const dirToSaveAt = `.\\assets\\downloaded_akamai_scripts\\${this.host}`;
    await mkdir(dirToSaveAt, { recursive: true }, (err) => {
      if (err) throw err;
    });
  };

  /**
   * Fetch the contents of the target site.
   * @returns {string} The response body of the request.
   */
  siteRequest = async () => {
    // console.log("Fetching site:", this.site);
    const config = {
      method: "get",
      url: this.site,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36",
    };
    const { data, status } = await axios(config);
    if (status != 200) {
      return null;
    } else {
      return data;
    }
  };
  /**
   * Get the URL of the Akamai 2.0 script.
   *
   * The script is USUALLY the last script in the HTML.
   *
   * However, it also covers the case where the sec-cpt script is last and the Akamai 2.0 script is 2nd last.
   *
   * It's possible that this function can return an incorrect script URL if neither of the above cases are true.
   *
   * This should probably be improved by using Regex to avoid that.
   *
   * @param {string} data The contents of the target site
   * @returns {string} The URL of the Akamai 2.0 script.
   */
  parseAkamaiUrl = (data) => {
    const $ = load(data);
    let akamaiURL = "";
    try {
      const scriptArr = $("script");
      akamaiURL =
        "https://" + this.host + scriptArr[scriptArr.length - 1].attribs.src;
      if (akamaiURL.includes("sec-cpt")) {
        akamaiURL =
          "https://" + this.host + scriptArr[scriptArr.length - 2].attribs.src;
      }
    } catch (e) {
      console.error(e);
    }
    // console.log("Parsed Akamai URL:", akamaiURL);
    this.akamaiURL = akamaiURL;
    return akamaiURL;
  };

  /**
   * Fetch the raw contents of the Akamai 2.0 script.
   * @param {string} akamaiURL The URL of the Akamai 2.0 script.
   * @returns {string} The body of the Akamai 2.0 script.
   */
  scriptRequest = async (akamaiURL) => {
    // console.log("Making request to script...");
    const config = {
      method: "get",
      url: akamaiURL,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36",
    };
    const { data, status } = await axios(config);
    if (status != 200) {
      return null;
    } else {
      return data;
    }
  };

  /**
   * Get the MD5 hash of the Akamai 2.0 script
   * @param {string} content The raw body of the Akamai 2.0 script.
   * @returns {string} The hash of the script.
   */

  getScriptHash = (content) => {
    // console.log("Hashing script content...");
    let hash = crypto.createHash("md5");
    let data = hash.update(content, "utf-8");
    const scriptHash = data.digest("hex");
    // console.log("Got script hash:", scriptHash);
    return scriptHash;
  };
  /**
   * Since Akamai 2.0 has no version numbers and frequent updates, its common to use the top identifier name to represent the version.
   * This is for reference only and to make searching for the saved script easier.
   * They could, theoretically, push a different script that has an old identifier name at the top. It's best to rely on the script hash for differences.
   *
   * Update (September 2022): They do this now!
   *
   * @param {string} content The raw body of the Akamai 2.0 script.
   * @returns {string} The name of the top identifier.
   */
  getTopIdentifier = (content) => {
    let topIdentifierName = "";
    try {
      topIdentifierName = content.split("(function(){var ")[1].split("={}")[0];
      return topIdentifierName;
    } catch {
      return "Could not parse the name of top identifier.";
    }
  };

  /**
   * Compares the stored hash to the newly one, and stores the new hash if they're different.
   * @param {string} newHash The newly computed hash
   * @returns {Boolean} false for identical hashes, true for different hashes.
   */
  isNewHash = (newHash) => {
    // Check if it's already in the folder
    let isAlreadyInFolder;
    const fileNames = readdirSync(
      `.\\assets\\downloaded_akamai_scripts\\${this.host}`
    );

    isAlreadyInFolder = fileNames.some((filename) =>
      filename.includes(newHash)
    );

    if (isAlreadyInFolder) {
      return false;
    }

    // Check if it was seen in the session
    if (this.seenHashes.includes(newHash)) {
      console.log("Found repeating hash");
      return false;
    }
    console.log(`Script change found on ${this.host}\n Hash:`, newHash);
    this.seenHashes.push(newHash);
    // Increment unique count

    this.uniqueCount++;
    return true;
  };
  /**
   * Saves the fetched script to the system drive.
   * The filename includes the hostname, top identifier name, and script hash for ease of searching.
   * @param {string} scriptBody the raw contents of the script.
   * @param {string} topIdentifier the name of the top identifier.
   */
  saveScriptToDisk = (scriptBody, topIdentifier) => {
    const outputPath = `.\\assets\\downloaded_akamai_scripts\\${this.host}\\${this.host}_${topIdentifier}_${this.scriptHash}.js`;

    writeFileSync(outputPath, scriptBody, (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log(`Saved updated script to ${outputPath}`);
      }
    });
  };
}

module.exports = {
  Worker: Worker,
};
