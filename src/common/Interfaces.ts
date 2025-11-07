

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
