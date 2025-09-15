export class TelegramClient {
    #chatId;
    #botToken;
  
    constructor ({chatId, botToken}) {
      this.#chatId = chatId;
      this.#botToken = botToken
    }
  
    sendMessage = (text) => {
      return fetch(
        `https://api.telegram.org/bot${this.#botToken}/sendMessage`,
        {
          method: 'post',
          body: JSON.stringify({
            chat_id: this.#chatId,
            text: text,
            disable_web_page_preview: true,
          }),
          headers: {
            'content-type': 'application/json'
          },
        }
      ).catch(console.log)
    }
  
    sendAttachment = ({
      caption,
      content,
      attachmentName,
    }) => {
      const blob = new Blob([content], { type: 'plain/text' });
  
      const formData = new FormData();
      formData.append('chat_id', this.#chatId);
      formData.append('document', blob, attachmentName);
      formData.append('caption', caption);
  
      return fetch(
        `https://api.telegram.org/bot${this.#botToken}/sendDocument`,
        {
          method: 'post',
          body: formData,
        }
      ).catch(console.log)
    }
}
