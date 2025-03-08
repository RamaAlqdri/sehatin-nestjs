import { Injectable } from '@nestjs/common';
import { Schedule } from '../entity/schedule.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Food } from 'src/food/entity/food.entity';
import { User } from 'src/user/entity/user.entity';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createSchedule(request: CreateScheduleDto): Promise<Schedule> {
    try {
      const food = await this.foodRepository.findOne({
        where: { id: request.food_id },
      });
      const user = await this.userRepository.findOne({
        where: { id: request.user_id },
      });

      if (!food || !user) {
        throw new Error('Food or User not found');
      }

      const newSchedule = this.scheduleRepository.create({
        ...request,
        food,
        user,
      });

      await this.scheduleRepository.save(newSchedule);
      return newSchedule;
    } catch (error) {
      throw error;
    }
  }

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      return await this.scheduleRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async getScheduleByUserid(userid: string): Promise<Schedule[]> {
    try {
      return await this.scheduleRepository.find({
        where: { user: { id: userid } },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateSchedule(
    schedule_id: string,
    request: UpdateScheduleDto,
  ): Promise<Schedule> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: schedule_id },
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (request.food_id) {
        const food = await this.foodRepository.findOne({
          where: { id: request.food_id },
        });
        if (!food) {
          throw new Error('Food not found');
        }
        schedule.food = food;
      }

      if (request.calories_burned) {
        schedule.calories_burned = request.calories_burned;
      }

      if (request.scheduled_at) {
        schedule.scheduled_at = request.scheduled_at;
      }

      if (request.water_consum) {
        schedule.water_consum = request.water_consum;
      }

      if (request.is_completed !== null) {
        schedule.is_completed = request.is_completed;
      }

      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async getScheduleForUserByDay(
    userId: string,
    date: Date,
  ): Promise<Schedule[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: Between(startOfDay, endOfDay),
        },
      });

      return schedules;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getScheduleForUserByMonth(
    userId: string,
    date: Date,
  ): Promise<Schedule[]> {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const startOfMonth = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        1,
      );
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth() + 1,
        0,
      );
      endOfMonth.setHours(23, 59, 59, 999);

      const schedules = await this.scheduleRepository.find({
        where: {
          user: { id: userId },
          scheduled_at: Between(startOfMonth, endOfMonth),
        },
      });

      return schedules;
    } catch (error) {
      throw new Error(error);
    }
  }
}
