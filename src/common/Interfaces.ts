

export enum Roles {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
}



export interface payloadToken{
    sub:string,
    role:Roles,
}


export enum EMAIL_TYPE{
   VERIFICATION_CODE='verification_code',
   RESERVATION_CONFIRM = 'client_reservation',
   ADMIN_CONFIRM = 'admin_reservation'
}

export enum BookingModeType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}



export enum BookingName {
   PER_HOUR = 'per hour',
   PER_DAY = 'per day',
   PER_WEEK = 'per week',
   PER_MONTH = 'per month',
};




export enum JobNameImages {
  UPLOADIMAGES = "upload-images-cloud",
  UPDATEIMAGES = "update-images-cloud"
}


export enum RESERVATION_STATUS {
  CREATED = "CREATED",              // Reserva creada sin pagar
  PAID = "PAID",                    // Pagado y confirmado
  CANCELLED = "CANCELLED",          // Cancelado
  EXPIRED = "EXPIRED",              // No pagó a tiempo
  IN_PROGRESS = "IN_PROGRESS",      // El usuario está utilizando el servicio
  COMPLETED = "COMPLETED",          // Finalizada correctamente
}


export enum PAYMENTS_STATUS {
  PENDING = "PENDING",             
  PAID = "PAID",                    
  CANCELLED = "CANCELLED",
  UPDATED = "UPDATED"
}


export enum PROVIDERS {

  MP = 'MERCADO_PAGO',
  STRIPE = 'STRIPE',
}



export enum PAYMENT_ACCOUNTS_STATUS {

  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',


}


export const VERSION_APP_URL= 'api/v1/reservations';