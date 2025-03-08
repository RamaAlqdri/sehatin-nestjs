import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
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
      return new ResponseWrapper(HttpStatus.OK, 'Schedule Found', schedule);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getScheduleByUserId(
    @Param('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const schedule = await this.scheduleService.getScheduleByUserid(userId);
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

  @Get('day/:userId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getDailySchedule(
    @Param('userId') userId: string,
    @Body() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const schedule = await this.scheduleService.getScheduleForUserByDay(
        userId,
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

  @Get('month/:userId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getMonthSchedule(
    @Param('userId') userId: string,
    @Body() request: GetScheduleDto,
  ): Promise<ResponseWrapper<any>> {
    try {
      const schedule = await this.scheduleService.getScheduleForUserByMonth(
        userId,
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
}
