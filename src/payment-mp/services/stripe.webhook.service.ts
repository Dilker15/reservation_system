import { Injectable } from "@nestjs/common";
import { WebhookEventParse } from "../interfaces/create.payment";
import { IWebhook } from "../interfaces/WebHookStrategy";


@Injectable()
export class StripeWebhookService implements IWebhook{
    

    processEvent(event: WebhookEventParse): Promise<void> {
        throw new Error("Method not implemented.");
    }

}


