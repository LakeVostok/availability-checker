import { fetchWIthStages } from './fetchWIthStages.js';
  
export class BankClient {
    get = async ({
        uri,
        uuid,
    }) => {
        const diagnostics = await fetchWIthStages(uri, uuid);
        const httpsStage = diagnostics.stages.find(({stage}) => stage === "https");

        const response = {
            status: httpsStage ? String(httpsStage.status) : "000",
            message: httpsStage ? httpsStage.statusMessage : "",
            body: diagnostics.body,
        }

        delete diagnostics.body;

        return [
            response,
            diagnostics,
        ];
    }
}
