import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class GetScheduleDto {
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  date: Date;
}
