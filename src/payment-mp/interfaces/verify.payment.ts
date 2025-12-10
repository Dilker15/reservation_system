import { PAYMENTS_STATUS } from "src/common/Interfaces";





export interface VerifyPaymentResult {

    provider: 'stripe' | 'mp';
    paymentId: string;
    reservationId?: number;
    status: PAYMENTS_STATUS,
    amount?: number;
    payerEmail?: string;
    payerName?: string;
    raw?: any;

  }
  