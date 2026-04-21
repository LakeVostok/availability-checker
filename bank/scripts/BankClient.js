import { fetchWIthStages } from './fetchWIthStages.js';
  
export class BankClient {
    get = async ({
        uri,
        uuid,
    }) => {
        const initialdiagnostics = await fetchWIthStages(uri, uuid);
        const initialHttpsStage = initialdiagnostics.stages.find(({stage}) => stage === "https");

        const initialResponse = {
            status: initialHttpsStage ? String(initialHttpsStage.status) : "000",
            message: initialHttpsStage ? initialHttpsStage.statusMessage : "",
            body: initialdiagnostics.body,
        }

        delete initialdiagnostics.body;

        if (initialHttpsStage) {
            if (
                (initialHttpsStage.status === 301 || initialHttpsStage.status === 302)
                && initialHttpsStage.headers.location
            ) {
                const redirectedDiagnostics = await fetchWIthStages(initialHttpsStage.headers.location, uuid);
                const redirectedHttpsStage = redirectedDiagnostics.stages.find(({stage}) => stage === "https");

                const redirectedResponse = {
                    status: redirectedHttpsStage ? String(redirectedHttpsStage.status) : "000",
                    message: redirectedHttpsStage ? redirectedHttpsStage.statusMessage : "",
                    body: initialdiagnostics.body,
                }

                delete redirectedDiagnostics.body;

                return [
                    redirectedResponse,
                    [
                        initialdiagnostics,
                        redirectedDiagnostics,
                    ]
                ];
            }
        }

        return [
            initialResponse,
            initialdiagnostics,
        ]
    }
}
