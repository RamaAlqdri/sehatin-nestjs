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

  @Put(':scheduleId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin')
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<ResponseWrapper<any>> {
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

  @Get('day')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getDailySchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
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

  @Get('calories')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getCaloriesSchedule(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
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
    @Body() request: GetScheduleDto,
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
        await this.scheduleService.getUserCompletedSchedulePercentage(id);
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
