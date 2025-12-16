import { PAYMENTS_STATUS, PROVIDERS } from "src/common/Interfaces";





export interface VerifyPaymentResult {

    provider: PROVIDERS,
    paymentId: string;
    reservationId?: number;
    status: string
    amount?: number;
    payerEmail?: string;
    payerName?: string;
    paymentMethod?: string,
    external_reference:string,

  }
  