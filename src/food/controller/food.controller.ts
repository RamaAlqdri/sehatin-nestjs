import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FoodService } from '../service/food.service';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { Roles } from 'src/auth/jwt/decorators/roles.decorator';
import { RoleGuard } from 'src/auth/jwt/guards/roles.guard';
import { CreateFoodDto } from '../dto/create-food.dto';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { UpdateFoodDto } from '../dto/update-food.dto';
import { MealType } from '../entity/food_history.entity';

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

  @Get('detail')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getFoodById(
    @Query('foodId') foodId: string,
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

  @Get('recommendation')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getRandomListFood(): Promise<ResponseWrapper<any>> {
    try {
      const food = await this.foodService.getRandomListFood();
      return new ResponseWrapper(HttpStatus.OK, 'Food Found', food);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Post('history')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user')
  async addFoodHistory(
    @Body('food_id') food_id: string,
    @Body('meal_type') meal_type: MealType,
    @Body('serving_amount') serving_amount: number,
    @Body('date') date: Date,
    @Req() req: any,
  ): Promise<ResponseWrapper<any>> {
    try {
      const userId = req.user.id;
      await this.foodService.addFoodToFoodHistory(
        userId,
        food_id,
        serving_amount,
        meal_type,
        date,
      );
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Food History Created Successfully',
        // foodHistory,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Delete('history')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user')
  async deleteFoodHistory(
    @Query('food_id') food_id: string,
    @Query('meal_type') meal_type: MealType,
    @Query('date') date: Date,
    @Req() req: any,
  ): Promise<ResponseWrapper<any>> {
    try {
      const userId = req.user.id;
      await this.foodService.deleteFoodHistory(
        food_id,
        userId,
        meal_type,
        date,
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        'Food History Deleted Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Get('history')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user')
  async getFoodHistoryByFoodIdMealTypeUserIdDate(
    @Query('food_id') food_id: string,
    @Query('meal_type') meal_type: MealType,
    @Query('date') date: Date,
    @Req() req: any,
  ): Promise<ResponseWrapper<any>> {
    try {
      const userId = req.user.id;
      const foodHistory =
        await this.foodService.getFoodHistoryByFoodIdMealTypeUserIdDate(
          food_id,
          userId,
          meal_type,
          date,
        );
      return new ResponseWrapper(
        HttpStatus.OK,
        'Food History Found',
        foodHistory,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('historys/range')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user')
  async getFoodHistorysByRange(
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
    @Req() req: any,
  ): Promise<ResponseWrapper<any>> {
    try {
      const userId = req.user.id;
      const foodHistory = await this.foodService.getFoodHistoryByDateRange(
        userId,
        start_date,
        end_date,
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        'Food History Found',
        foodHistory,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('history/summary')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user')
  async getFoodHistorySummary(
    @Req() req: any,
    @Query('mode') mode: 'day' | 'range' | '7days' | '30days',
    @Query('date') date: Date, // ISO string, eg: '2025-05-03'
    @Query('start_date') startDate?: Date,
    @Query('end_date') endDate?: Date,
  ): Promise<ResponseWrapper<any>> {
    try {
      const userId = req.user.id;

      const baseDate = new Date(date);
      let startOfDay: Date | undefined;
      let endOfDay: Date | undefined;

      // console.log('baseDate', baseDate);
      // console.log('mode', mode);
      // console.log('startDate', startDate);
      // console.log('endDate', endDate);

      switch (mode) {
        case 'range':
          if (!startDate || !endDate)
            throw new BadRequestException('Missing start or end');
          // startDate = new Date(start);
          // endDate = new Date(end);
          startOfDay = new Date(startDate);
          startOfDay.setHours(0, 0, 0, 0);
          endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          break;
        case '7days':
          const _endDate7days = new Date(baseDate);
          const _startDate7days = new Date(baseDate);
          _startDate7days.setDate(_endDate7days.getDate() - 7);
          startOfDay = new Date(_startDate7days);
          startOfDay.setHours(0, 0, 0, 0);
          endOfDay = new Date(_endDate7days);
          endOfDay.setHours(23, 59, 59, 999);
          break;
        case '30days':
          const _endDate30days = new Date(baseDate);
          const _startDate30days = new Date(baseDate);
          _startDate30days.setDate(_endDate30days.getDate() - 30);
          startOfDay = new Date(_startDate30days);
          startOfDay.setHours(0, 0, 0, 0);
          endOfDay = new Date(_endDate30days);
          endOfDay.setHours(23, 59, 59, 999);
          break;
        case 'day':
        default:
          startOfDay = new Date(baseDate);
          startOfDay.setHours(0, 0, 0, 0);
          endOfDay = new Date(baseDate);
          endOfDay.setHours(23, 59, 59, 999);
          break;
      }

      // console.log('baseDate', baseDate);
      // console.log('mode', mode);
      // console.log('startDate', startOfDay);
      // console.log('endDate', endOfDay);

      const summary = await this.foodService.getFoodHistorySummaryAdv(
        userId,
        startOfDay,
        endOfDay,
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        'Food History Summary Found',
        summary,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('historys')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user')
  async getFoodHistorys(
    @Query('meal_type') meal_type: MealType,
    @Query('date') date: Date,
    @Req() req: any,
  ): Promise<ResponseWrapper<any>> {
    try {
      const userId = req.user.id;
      const foodHistory = await this.foodService.getFoodHistorys(
        userId,
        meal_type,
        date,
      );
      return new ResponseWrapper(
        HttpStatus.OK,
        'Food History Found',
        foodHistory,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
}
