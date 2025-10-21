

import { Expose } from 'class-transformer';

export class ImageResponseDto {
  @Expose()
  id: string;

  @Expose()
  storage_id: string;

  @Expose()
  url: string;

  
}
