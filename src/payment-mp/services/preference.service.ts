import { Inject, Injectable } from "@nestjs/common";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { MP_CONFIG } from "../mp.config";



@Injectable()
export class PreferencesMp{
    private readonly preferences:Preference;

    constructor( @Inject(MP_CONFIG) private readonly config: MercadoPagoConfig){
        this.preferences = new Preference(config);
    }


    async createPreference(data:any){
        const responseMp = await this.preferences.create({
                body: {
                    items: data.items,
                    back_urls: data.backUrls,
                    auto_return: 'approved',
                    notification_url: "https://webhook.site/be335547-d85a-41ae-8e49-e45331cd6d73",
                    metadata:{
                        order_id:data.order
                    },
                    external_reference:"referencia externa test",
                },
    
                
            });
        return responseMp;
    }

}