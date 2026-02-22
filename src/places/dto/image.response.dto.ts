

import { Expose, Type } from 'class-transformer';

export class ImageResponseDto {
  @Expose()
  id: string;

  @Expose()
  storage_id: string;

  @Expose()
  url: string;

  
}


export class AmenityNameDto {
  @Expose()
  name: string;
}

export class AmenitiesResponseDto {

  @Expose()
  @Type(() => AmenityNameDto)
  amenity: AmenityNameDto;
}