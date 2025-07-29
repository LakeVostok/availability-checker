const axios = require("axios");
const { sendTelegramMessage } = require("./send_message_to_telegram");

const ALARM_CHAT_ID = process.env.ALARM_CHAT_ID;
const LOG_CHAT_ID = process.env.LOG_CHAT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;
const SMS_GATE_USERNAME = process.env.SMS_GATE_USERNAME;
const SMS_GATE_PASSWORD = process.env.SMS_GATE_PASSWORD;

const limit = 500;

async function check() {
  let result = "";
  try {
    const url = `https://sms6.rmlconnect.net/CreditCheck/checkcredits?username=${SMS_GATE_USERNAME}&password=${SMS_GATE_PASSWORD}`;
    const response = await axios.get(url, {
      timeout: 5000,
    });
    result = response.data.trim();
  } catch (error) {
    console.error("Error fetching SMS gate balance:", error.message);
    result = "ERROR_FETCHING_BALANCE";
  }

  let balance;

  let tempBalance = result.includes(":")
    ? result.substring(result.indexOf(":") + 1)
    : result;

  if (tempBalance.includes(".")) {
    balance = tempBalance.substring(0, tempBalance.indexOf("."));
  } else {
    balance = tempBalance;
  }

  let numericBalance = parseInt(balance, 10);

  if (balance === "PERMISSION DENIED") {
    await sendTelegramMessage(
      ALARM_CHAT_ID,
      BOT_TOKEN,
      `Alarm\nSMS gate: failed to get the balance. Current status is ${balance}`
    );
  } else if (!isNaN(numericBalance) && numericBalance < limit) {
    await sendTelegramMessage(
      ALARM_CHAT_ID,
      BOT_TOKEN,
      `Alarm\nSMS gate balance is ${numericBalance}`
    );
  } else if (!isNaN(numericBalance)) {
    await sendTelegramMessage(
      LOG_CHAT_ID,
      BOT_TOKEN,
      `SMS gate balance is ${numericBalance}`
    );
  } else {
    await sendTelegramMessage(
      ALARM_CHAT_ID,
      BOT_TOKEN,
      `Alarm\nSMS gate: failed to get or parse balance. Current status is ${balance}`
    );
  }
}

check();
