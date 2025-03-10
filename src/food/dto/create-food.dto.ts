import { IsString, IsNumber } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  ingredients: string;

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
