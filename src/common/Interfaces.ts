

export enum Roles {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}



export interface payloadToken{
    sub:string,
    role:Roles,
}


export enum EMAIL_TYPE{
   VERIFICATION_CODE,
   RESERVATION_CONFIRM,
}

