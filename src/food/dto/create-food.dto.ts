import { IsString, IsNumber } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  fat: number;

  @IsNumber()
  calories: number;

  @IsNumber()
  carb: number;

  @IsNumber()
  protein: number;

  @IsNumber()
  fiber: number;
}
