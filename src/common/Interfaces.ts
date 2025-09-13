

export enum Roles {
  ADMIN = 'ADMIN',
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

