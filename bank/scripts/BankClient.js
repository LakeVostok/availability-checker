import { Agent } from 'undici';

const httpsAgent = new Agent({
    connect: {
      rejectUnauthorized: false,
      timeout: 15000
    },
  });
  
export class BankClient {
    get = async ({
    uri,
    uuid,
    }) => {
        const response = await fetch(uri, {
            dispatcher: httpsAgent,
            headers: {
                "User-Agent": "Friend",
                "Req-Id": uuid,
            }
        });

        return response;
    }
}
