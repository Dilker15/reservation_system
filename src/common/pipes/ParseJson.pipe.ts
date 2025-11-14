import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseAndValidateJsonPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      throw new BadRequestException('opening_hours is required');
    }
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new BadRequestException('opening_hours must be a non-empty array');
      }
      const days = parsed.map((h: any) => h.day);
      const uniqueDays = new Set(days);
      if (days.length !== uniqueDays.size) {
        throw new BadRequestException('All opening_hours days must be unique');
      }

      return parsed;
    } catch (e) {
      throw new BadRequestException('Invalid JSON string for opening_hours');
    }
  }
}
