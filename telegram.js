require("dotenv").config();

const https = require("https");

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.ALARM_CHAT_ID;

if (!TOKEN || !CHAT_ID) {
  throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set");
}

function sendTelegramMessage(text) {
  console.log("Sending to Telegram:", text);

  const payload = JSON.stringify({
    chat_id: CHAT_ID,
    text,
  });

  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/bot${TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
    // agent: httpsAgent,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
        resolve(JSON.parse(body));
      });
    });

    req.on("error", (err) => {
      console.error("Telegram request error:", err);
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy(new Error("Request timed out"));
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { sendTelegramMessage };
