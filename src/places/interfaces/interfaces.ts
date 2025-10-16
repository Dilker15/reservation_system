

export interface TimeSlot {
  from: string;
  to: string;
}

export interface Availability {
  [day: string]: TimeSlot[];
}


export interface FieldLocation{
    latitude:number,
    longitude:number,
}


export enum placeEnumStatus {
    ACTIVE = 'active',
    PROCESSING = 'processing',
    INACTIVE = 'inactive',
}