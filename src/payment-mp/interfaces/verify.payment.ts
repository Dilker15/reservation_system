import { PAYMENTS_STATUS, PROVIDERS } from "src/common/Interfaces";





export interface VerifyPaymentResult {

    provider: PROVIDERS,
    paymentId: string;
    reservationId?: number;
    status: PAYMENTS_STATUS,
    amount?: number;
    payerEmail?: string;
    payerName?: string;
    raw?: any;

  }
  