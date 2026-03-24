import { 
  IsString, 
  IsNumber, 
  IsUUID, 
  ValidateNested, 
  IsArray,
  ArrayUnique,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AvailabilityDto } from './availability.dto';

export class CreatePlaceDto {
 
  @ApiProperty({ example: 'Cozy Apartment Downtown' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Nice place with great view' })
  @IsString()
  description: string;

  @ApiProperty({ example: '123 Main Street, City' })
  @IsString()
  address: string;

  @ApiProperty({ example: -34.6037, description: 'Latitude coordinate' })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -58.3816, description: 'Longitude coordinate' })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiProperty({
    type: [AvailabilityDto],
    description: 'Opening hours per day',
  })
  @IsArray()
  @ArrayUnique((o: AvailabilityDto) => o.day)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  opening_hours: AvailabilityDto[];

  @ApiProperty({ example: 100, description: 'Price per booking' })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'uuid', description: 'City ID' })
  @IsUUID()
  city_id: string;

  @ApiProperty({ example: 'uuid', description: 'Booking mode ID' })
  @IsUUID()
  booking_mode_id: string;

  @ApiProperty({ example: 'uuid', description: 'Category ID' })
  @IsUUID()
  category_id: string;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsNumber()
  max_guests: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  bedrooms: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  bathrooms: number;

  @ApiProperty({ example: 80, description: 'Size in square meters' })
  @Type(() => Number)
  @IsNumber()
  size_m2: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['uuid1', 'uuid2'],
    description: 'Optional list of amenity IDs',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  amenity_ids?: string[];
}