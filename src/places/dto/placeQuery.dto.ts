import { Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min
} from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { placeEnumStatus } from "../interfaces/interfaces";
import { ApiPropertyOptional } from "@nestjs/swagger";


export class PlaceQueryDto extends PaginationDto {

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by category ID' })
  @IsUUID()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by city ID' })
  @IsUUID()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by reservation mode ID' })
  @IsUUID()
  @IsOptional()
  reservation_mode?: string;

  @ApiPropertyOptional({ example: 50, description: 'Minimum price' })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'min price should be greater than zero' })
  @IsOptional()
  min_price?: number;

  @ApiPropertyOptional({ example: 200, description: 'Maximum price' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  max_price?: number;

  @ApiPropertyOptional({ example: 4, description: 'Maximum guests allowed' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  max_guests?: number;

  @ApiPropertyOptional({ example: 2, description: 'Number of bedrooms' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  bedrooms?: number;
}


export class PlaceOwnerQueryDto extends PaginationDto {

  @ApiPropertyOptional({
    enum: placeEnumStatus,
    example: placeEnumStatus.ACTIVE,
    description: 'Filter by place status'
  })
  @IsOptional()
  @IsEnum(placeEnumStatus, { message: `status must be a valid placeEnumStatus value` })
  status?: placeEnumStatus;

  @ApiPropertyOptional({
    example: 'apartment',
    description: 'Filter by place name'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}