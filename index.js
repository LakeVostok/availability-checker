require("dotenv").config();

const https = require("https");
const http = require("http");

const { URL } = require("url");
const { sendTelegramMessage } = require("./telegram.js");
const { log } = require("./log.js");

const HEARTBEAT_URLS = process.env.HEARTBEAT_URLS
  ? process.env.HEARTBEAT_URLS.split(",")
  : [];

if (HEARTBEAT_URLS.length === 0) {
  log("No heartbeat URLs configured.", true);
  process.exit(1);
}

function checkUrlHeartbeat(url) {
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === "https:";
  const client = isHttps ? https : http;
  const agent = isHttps
    ? new https.Agent({ rejectUnauthorized: true })
    : new http.Agent();

  const req = client.get(url, { timeout: 5000, agent }, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      if (res.statusCode === 200 && data) {
        log(`[${url}] Heartbeat successful`);
      } else {
        const errorMessage = `[${url}] Unexpected response: ${res.statusCode}`;
        log(errorMessage, true);
        sendTelegramMessage(errorMessage);
      }
    });
  });

  req.on("error", (err) => {
    const errorMessage = `[${url}] Request failed: ${err.message}`;
    log(errorMessage, true);
    sendTelegramMessage(errorMessage);
  });

  req.on("timeout", () => {
    req.abort();
    const errorMessage = `[${url}] Request timed out`;
    log(errorMessage, true);
    sendTelegramMessage(errorMessage);
  });
}

function runHeartbeatCheck() {
  HEARTBEAT_URLS.forEach(checkUrlHeartbeat);
}

setInterval(runHeartbeatCheck, 60 * 1000);
runHeartbeatCheck();
