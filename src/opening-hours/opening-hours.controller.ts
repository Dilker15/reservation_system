import { Controller, Patch, Param, Delete, ParseUUIDPipe, Body } from '@nestjs/common';
import { OpeningHoursService } from './opening-hours.service';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { Role } from 'src/auth/decorators/role.decorator';
import { Roles } from 'src/common/Interfaces';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Opening Hours')
@ApiBearerAuth()
@Role(Roles.OWNER)
@Controller('opening-hours')
export class OpeningHoursController {
  constructor(private readonly openingHoursService: OpeningHoursService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update an opening hour' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateOpeningHourDto })
  @ApiResponse({ status: 200, description: 'Opening hour updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOpeningHourDto: UpdateOpeningHourDto,
    @GetUser() owner: User,
  ) {
    return this.openingHoursService.update(id, updateOpeningHourDto, owner);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an opening hour' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        place_id: { type: 'string', example: 'uuid' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Opening hour deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) hour_id: string,
    @Body('place_id', ParseUUIDPipe) place_id: string,
    @GetUser() owner: User,
  ) {
    return this.openingHoursService.remove(hour_id, place_id, owner);
  }
}