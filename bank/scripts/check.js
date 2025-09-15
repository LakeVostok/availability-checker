import {randomUUID} from "node:crypto"

import { TelegramClient } from "./TelegramClient.js";
import { BankClient } from "./BankClient.js";
import { withLatency } from "./withLatency.js";
import { getLogMessage } from "./getLogMessage.js";

const alarmTelegramClient = new TelegramClient({
  chatId: process.env.ALARM_CHAT_ID,
  botToken: process.env.BOT_TOKEN,
})

const logTelegramClient = new TelegramClient({
  chatId: process.env.LOG_CHAT_ID,
  botToken: process.env.BOT_TOKEN,
})

const bankClient = new BankClient;

const uriList = [
  "https://sberbank.co.in/",
  "https://online.sberbank.co.in/",
  "https://guest.online.sberbank.co.in/",
];

const getResult = async ({ uri, uuid }) => {
  try {
    const response = await bankClient.get({ uri, uuid });

    if (response.ok && response.status === 200) {
      return {
        right: {
          status: response.status
        }
      }
    } else {
      const rawResponse = await response.text();

      return {
        left: {
          status: response.status ? String(response.status) : "000",
          message: response.statusText || "",
          content: rawResponse,
        }
      }

    }
  } catch (e) {
    return {
      left: {
        status: e.status ? String(e.status) : "000",
        message: e.cause.message || "",
      }
    }
  }
}

const checkUri = withLatency(getResult)

async function checkUriList({ uriList }) {
  for (const uri of uriList) {
    const uuid = randomUUID();

    const [response, requestDuration] = await checkUri({ uri, uuid });

    if (response.left) {
      const alarmMessage = getLogMessage({
        message: `${uri} ${response.left.status} ${requestDuration}\n${response.left.message}`
      });

      if (response.left.content) {
        await Promise.all([
          alarmTelegramClient.sendAttachment({
            caption: alarmMessage,
            content: response.left.content,
            attachmentName: uuid
          }),
          logTelegramClient.sendAttachment({
            caption: alarmMessage,
            content: response.left.content,
            attachmentName: uuid
          })
        ])
      } else {
        await Promise.all([
          alarmTelegramClient.sendMessage(alarmMessage),
          logTelegramClient.sendMessage(alarmMessage)
        ])
      }
    } else {
      const logMessage = getLogMessage({
        message: `${uri} ${response.right.status} ${requestDuration}`
      });

      await logTelegramClient.sendMessage(logMessage)
    }
  }
}

checkUriList({ uriList });
