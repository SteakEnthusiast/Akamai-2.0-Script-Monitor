# Akamai 2.0 Script Monitor

A simple program to notify you whenever the Akamai 2.0 script updates on a website via a discord webhook.

## Features

- Notifications via Discord Webhook Integration:

  ![Embed Result](https://user-images.githubusercontent.com/87380460/174300033-52e2dcc4-a8a1-478c-8858-b412a1c15e66.PNG)

- Saves the Akamai 2.0 script to the file system.

  - Scripts are saved to the `\assets\downloaded_akamai_scripts\${HOSTNAME}` folder.
  - If this directory doesn't already exist, it will be created for you.
  - Filename format:
    **`${hostname}_${topIdentifierName}_${scriptHash}.js`**
    Where **`${hostname}`** is the domain name of the target site, **`${topIdentifierName}`** is the variable name of the empty object declared at the top of the script, and **`${scriptHash}`** is the MD5 hash of the script.

- Uniqueness check:
  - This program will iterate through the `downloaded_akamai_scripts/${HOSTNAME}` to determine if the script has been seen before.
  - After each request, the number of unique scripts for the current session will be logged to the console.
  - Ex:
    ```
    Script change found on accounts.zalando.com
    Hash: 974d7b082b1edeaff7bed512e29e46c6
    2 out of 2 scripts scraped this session were unique.
    ```
  - This is useful to know if Akamai ever reuses an old script.

## Installation

Clone the repository, and install the dependencies with:

```bash
npm install
```

## Configuration

Open `/config/config.json/` to modify the monitor config.

### Delay Settings

Delay is an integer value representing the number of milliseconds to wait between each check. If one isn't supplied, the program will use a default value of 5000ms.

```json
    "delay": 5000,
```

### Webhook Settings

You _**MUST**_ configure the webhook settings to use this program.
You can extract the webhook id and token from a webhook URL: `https://discord.com/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}`.

```json

   "webhook":{
      "id":"${WEBHOOK_ID}",
      "token":"${WEBHOOK_TOKEN}"
   },

```

### Site Settings

You _**MUST**_ configure the site settings to use this program.
`sites` is a JSON Array containing the target sites. To add another target site, simply construct a new JSON object matching the specified format and add it to the `sites` array.

```json


   "sites":[
      {
         "url":"https://${HOSTNAME1}"
      },
      {
         "url":"https://${HOSTNAME2}"
      },
      {
         "url":"https://${HOSTNAME3}"
      }
   ]

```

## Usage

After configuring the file, start the monitor by running:

```bash
node index.js
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

# Bonus: Akamai 2.0 and Akamai 1.75 Sensor Data Generation API For Rent

## Features:
- 🧪 Supports versions: 1.75 & 2.0
- 🧪 custom usage plans that fits every business model
- 🧪 free trial
- 🧪 24/7 support from all timezones
- 🧪 scales without any limitations
- 🌐 FREE access to the best TLS client on the market. Each Akamai client gets a free TLS api key!
## Discord

Join our discord server and create a ticket for more information:
https://discord.gg/dmYqqeVnN2

