# Akamai 2.0 Script Monitor

A simple program to notify you whenever the Akamai 2.0 script updates on a website via a discord webhook.

## Features
- Notifications via Discord Webhook Integration:
![](https://i.ibb.co/X7spnN6/Capture.png)
- Saves the Akamai 2.0 script to the file system.
    - Scripts are saved to the `\assets\downloaded_akamai_scripts\${HOSTNAME}` folder.
    - Filename format:
    **`${hostname}_${topIdentifierName}_${scriptHash}.js`**
     Where **`${hostname}`** is the domain name of the target site, **`${topIdentifierName}`** is the variable name of the empty object declared at the top of the script, and **`${scriptHash}`** is the MD5 hash of the script.

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
// ...
    "delay": ${INTEGER}, //default 5000
// ...
```

### Webhook Settings
You _**MUST**_ configure the webhook settings to use this program. 
You can extract the webhook id and token from a webhook URL: `https://discord.com/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}`.
```json
// ...
   "webhook":{
      "id":"${WEBHOOK_ID}",
      "token":"${WEBHOOK_TOKEN}"
   },
// ...
```

### Site Settings
You _**MUST**_ configure the site settings to use this program.
`sites` is a JSON Array containing the target sites. To add another target site, simply construct a new JSON object matching the specified format and add it to the `sites` array.
```json
// ...

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
/// ...
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