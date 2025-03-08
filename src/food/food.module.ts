import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Food } from './entity/food.entity';
import { Schedule } from 'src/schedule/entity/schedule.entity';
import { FoodController } from './controller/food.controller';
import { FoodService } from './service/food.service';

@Module({
  imports: [TypeOrmModule.forFeature([Food, Schedule])],
  providers: [FoodService],
  controllers: [FoodController],
})
export class FoodModule {}
