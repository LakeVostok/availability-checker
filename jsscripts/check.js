const axios = require("axios");
const { sendTelegramMessage } = require("./send_message_to_telegram");
const { v4: uuidv4 } = require("uuid"); // To generate UUIDs, install with `npm install uuid`

const ALARM_CHAT_ID = process.env.ALARM_CHAT_ID;
const LOG_CHAT_ID = process.env.LOG_CHAT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

const uriList = [
  "https://online.sberbank.co.in/",
  "https://guest.online.sberbank.co.in/",
];

const getLogMessage = (uri, resCode, reqTime, errorMsg) => {
  return `[${new Date().toLocaleString()}] ${uri} ${resCode} ${reqTime}\n${errorMsg}`;
};

async function check() {
  for (const uri of uriList) {
    const uuid = uuidv4();

    let resCode = "000";
    let reqTime = "0.000";
    let errorMsg = "";

    try {
      const startTime = process.hrtime.bigint();
      const response = await axios.get(uri, {
        headers: {
          "User-Agent": "Friend",
          "Req-Id": uuid,
        },
        validateStatus: () => true,
        timeout: 5000,
      });
      const endTime = process.hrtime.bigint();

      resCode = response.status.toString();
      reqTime = (Number(endTime - startTime) / 1_000_000_000).toFixed(3);
      errorMsg = "";
    } catch (error) {
      errorMsg = error.message;
      resCode = "000";
      reqTime = "0.000";
    }

    const logMessage = getLogMessage(uri, resCode, reqTime, errorMsg);
    await sendTelegramMessage(LOG_CHAT_ID, BOT_TOKEN, logMessage);

    if (resCode !== "200") {
      const alarmMessage = `Alarm\n${logMessage}`;
      await sendTelegramMessage(ALARM_CHAT_ID, BOT_TOKEN, alarmMessage);
    }
  }
}

check();
