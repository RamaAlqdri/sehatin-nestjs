import { Transform } from 'class-transformer';
import { IsUUID, IsDate, IsOptional, IsBoolean } from 'class-validator';

export class UpdateScheduleDto {
  @IsUUID()
  @IsOptional()
  food_id: string;

  // @IsNumber()
  // @IsOptional()
  // calories_burned: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  scheduled_at: Date;

  // @IsNumber()
  // @IsOptional()
  // water_consum: number;

  @IsBoolean()
  @IsOptional()
  is_completed: boolean;
}
