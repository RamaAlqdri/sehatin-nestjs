import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FoodService } from '../service/food.service';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { Roles } from 'src/auth/jwt/decorators/roles.decorator';
import { RoleGuard } from 'src/auth/jwt/guards/roles.guard';
import { CreateFoodDto } from '../dto/create-food.dto';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { UpdateFoodDto } from '../dto/update-food.dto';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin')
  async create(
    @Body() createFoodDto: CreateFoodDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.foodService.createFood(createFoodDto);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Food Created Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('detail/:foodId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getFoodById(
    @Param('foodId') foodId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const food = await this.foodService.getFoodById(foodId);
      return new ResponseWrapper(HttpStatus.OK, 'Food Found', food);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('filter')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async filterFoods(
    @Query('name') name: string = '', // Default to an empty string if name is not provided
    @Query('limit') limit: number = 5, // Default to 5 if limit is not provided
  ): Promise<ResponseWrapper<any>> {
    try {
      const foods = await this.foodService.filterFoods(name, limit);
      return new ResponseWrapper(HttpStatus.OK, 'Filtered Foods Found', foods);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getFoods(): Promise<ResponseWrapper<any>> {
    try {
      const food = await this.foodService.getAllFood();
      return new ResponseWrapper(HttpStatus.OK, 'Food Found', food);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Put(':foodId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin')
  async updateFood(
    @Param('foodId') foodId: string,
    @Body() updateFoodDto: UpdateFoodDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.foodService.updateFood(foodId, updateFoodDto);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Food Updated Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('many')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getFoodByManyIds(
    @Body('food_ids') foodIds: string[],
  ): Promise<ResponseWrapper<any>> {
    console.log('masukn sini');
    console.log('foodIds', foodIds);
    try {
      const food = await this.foodService.getFoodByManyIds(foodIds);
      return new ResponseWrapper(HttpStatus.OK, 'Food Found', food);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
}
