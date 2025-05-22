import { Transform } from 'class-transformer';
import { IsUUID, IsDate } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  food_id: string;

  // @IsNumber()
  // calories_burned: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  scheduled_at: Date;
}
