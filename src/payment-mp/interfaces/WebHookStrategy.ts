import { WebhookEventParse } from "./create.payment";



export interface IWebhook {

    validateSignature(rawBody: string, signature: string): boolean;
    parseEvent(payload: any): WebhookEventParse;
    processEvent(event: WebhookEventParse): Promise<void>;

}