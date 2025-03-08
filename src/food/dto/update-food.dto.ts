import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateFoodDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  fat: number;

  @IsNumber()
  @IsOptional()
  calories: number;

  @IsNumber()
  @IsOptional()
  carb: number;

  @IsNumber()
  @IsOptional()
  protein: number;
}
