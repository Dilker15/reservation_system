import { PartialType } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-place.dto';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {


}
