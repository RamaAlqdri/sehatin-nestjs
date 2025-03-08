import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Food } from 'src/food/entity/food.entity';
import { Schedule } from './entity/schedule.entity';
import { ScheduleService } from './service/schedule.service';
import { ScheduleController } from './controller/schedule.controller';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Food, Schedule, User])],
  providers: [ScheduleService],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
