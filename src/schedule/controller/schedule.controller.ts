import {
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
import { ScheduleService } from '../service/schedule.service';
import { Roles } from 'src/auth/jwt/decorators/roles.decorator';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { RoleGuard } from 'src/auth/jwt/guards/roles.guard';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { GetScheduleDto } from '../dto/get-schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin')
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.scheduleService.createSchedule(createScheduleDto);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Schedule Created Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('detail/:scheduleId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getScheduleById(
    @Param('scheduleId') scheduleId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const schedule = await this.scheduleService.getScheduleById(scheduleId);
      console.log('Schedule:', schedule);
      return new ResponseWrapper(HttpStatus.OK, 'Schedule Found', schedule);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('user')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getScheduleByUserId(
    @Req() req: any,
    @Query('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const schedule = await this.scheduleService.getScheduleByUserid(id);
      return new ResponseWrapper(HttpStatus.OK, 'Schedule Found', schedule);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Put('')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin')
  async updateSchedule(
    @Query('scheduleId') scheduleId: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    console.log('ScheduleId:', scheduleId);
    try {
      await this.scheduleService.updateSchedule(scheduleId, updateScheduleDto);
      return new ResponseWrapper(
        HttpStatus.OK,
        'Schedule Updated Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Put('complete')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async completeSchedule(
    @Req() req: any,
    @Query('scheduleId') scheduleId: string,
    @Query('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    // console.log('ScheduleId:', scheduleId);
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.scheduleService.setCompleteSchedule(scheduleId, id);
      return new ResponseWrapper(
        HttpStatus.OK,
        'Schedule Completed Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Put('food')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async updateFoodSchedule(
    @Query('scheduleId') scheduleId: string,
    @Body('food_id') foodId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.scheduleService.updateFoodSchedule(scheduleId, foodId);
      return new ResponseWrapper(
        HttpStatus.OK,
        'Food Schedule Updated Successfully',
      );
    } catch (error) {
      console.error('Error:', error);
      throw new HttpException(
        new ResponseWrapper(
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error.message || 'An unexpected error occurred',
        ),
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('closest')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getClosestSchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query('date') date: Date,
  ): Promise<ResponseWrapper<any>> {
    // console.log('closest Schedule:', date);
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      console.log('req date:', date);
      const schedule = await this.scheduleService.getClosestSchedule(id, date);
      return new ResponseWrapper(HttpStatus.OK, 'Schedule Found', schedule);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('day')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getDailySchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    console.log(request);
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const schedule = await this.scheduleService.getScheduleForUserByDay(
        id,
        request.date,
      );
      return new ResponseWrapper(HttpStatus.OK, 'Schedule Found', schedule);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  // @Post('calories')
  // @UseGuards(JwtLoginAuthGuard, RoleGuard)
  // @Roles('admin', 'user')
  // async createCaloriesSchedule(
  //   @Req() req: any,
  //   @Query('userId') userId: string,
  //   @Body('calories') calories: number,
  // ): Promise<ResponseWrapper<any>> {
  //   try {
  //     const id = req.user.role === 'admin' && userId ? userId : req.user.id;
  //     await this.scheduleService.createCaloriesConsumed(id, calories);
  //     return new ResponseWrapper(
  //       HttpStatus.CREATED,
  //       'Calories Schedule Created Successfully',
  //     );
  //   } catch (error) {
  //     throw new HttpException(
  //       new ResponseWrapper(error.status, error.message),
  //       error.status,
  //     );
  //   }
  // }
  @Post('water')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async createWaterSchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body('water') water: number,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.scheduleService.createWaterConsumed(id, water);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Water Schedule Created Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Delete('water')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async deleteLatestWaterSchedule(
    @Req() req: any,
    @Query('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.scheduleService.deleteLatestWaterHistory(id);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Water Deleted Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Delete('water/id')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async deleteWaterIdSchedule(
    @Req() req: any,
    @Query('waterId') waterId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.scheduleService.deleteWaterbyId(waterId);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Water Deleted Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('calories/history')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getCaloriesHistory(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const calories = await this.scheduleService.getCaloriesHistoryForADay(
        id,
        request.date,
      );
      return new ResponseWrapper(HttpStatus.OK, 'Calories Fetched', calories);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Get('water/history')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getWaterHistory(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const calories = await this.scheduleService.getWaterHistoryForADay(
        id,
        request.date,
      );
      return new ResponseWrapper(HttpStatus.OK, 'Water Fetched', calories);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('calories')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getCaloriesSchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    console.log('Request:', request);
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const calories = await this.scheduleService.getUserCaloriesConsumedForDay(
        id,
        request.date,
      );
      return new ResponseWrapper(HttpStatus.OK, 'Calories Fetched', calories);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Get('water')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getWaterSchedule(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const calories = await this.scheduleService.getUserWaterConsumedForDay(
        id,
        request.date,
      );
      return new ResponseWrapper(HttpStatus.OK, 'Water Fetched', calories);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Get('progress')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getUserProgress(
    @Req() req: any,
    @Query('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const calories =
        await this.scheduleService.getUserWeightProgressToTarget(id);
      return new ResponseWrapper(
        HttpStatus.OK,
        'Diet Progress Fetched',
        calories,
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('month')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getMonthSchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      const schedule = await this.scheduleService.getScheduleForUserByMonth(
        id,
        request.date,
      );
      return new ResponseWrapper(HttpStatus.OK, 'Schedule Found', schedule);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Post('dummy')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async createRandomMonthlySchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body('month') month: number,
    @Body('year') year: number,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.scheduleService.createDummySchedule(id, month, year);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Dummy Monthly Schedule Created Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
}
