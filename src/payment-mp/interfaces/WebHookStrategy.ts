import { WebhookEventParse } from "./create.payment";



export interface IWebhook {

    processEvent(event:any): Promise<void>;

}