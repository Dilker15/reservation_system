

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