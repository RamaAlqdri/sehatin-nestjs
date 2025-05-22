import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Food } from 'src/food/entity/food.entity';
import { Schedule } from './entity/schedule.entity';
import { ScheduleService } from './service/schedule.service';
import { ScheduleController } from './controller/schedule.controller';
import { User } from 'src/user/entity/user.entity';
import { WaterHistory } from './entity/water_history.entity';
import { FoodHistory } from 'src/food/entity/food_history.entity';
import { WeightHistory } from 'src/user/entity/weight-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Food,
      Schedule,
      User,
      WaterHistory,
      FoodHistory,
      WeightHistory,
    ]),
  ],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
