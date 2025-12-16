import { Injectable } from "@nestjs/common";
import { WebhookEventParse } from "../interfaces/create.payment";
import { IWebhook } from "../interfaces/WebHookStrategy";


@Injectable()
export class StripeWebhookService implements IWebhook{
    

    validateSignature(rawBody: string, signature: string): boolean {
        throw new Error("Method not implemented.");
    }


    
    parseEvent(payload: any): WebhookEventParse {
        throw new Error("Method not implemented.");
    }


    processEvent(event: WebhookEventParse): Promise<void> {
        throw new Error("Method not implemented.");
    }



}


