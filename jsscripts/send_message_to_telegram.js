const axios = require("axios");

async function sendTelegramMessage(chatId, botToken, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await axios.post(
      url,
      {
        chat_id: chatId,
        text: text,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      `Error sending Telegram message for chat ID ${chatId}:`,
      error.message
    );
    if (error.response) {
      console.error("Telegram API response error data:", error.response.data);
    }
  }
}

module.exports = { sendTelegramMessage };
