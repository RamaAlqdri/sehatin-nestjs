import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { User } from './entity/user.entity';
import { Otp } from 'src/auth/entity/otp.user.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtLoginModule } from 'src/auth/jwt/module/jwt.module';
import { JwtForgotModule } from 'src/auth/jwt/module/jwt-forgot.module';
import { JwtLoginStrategy } from 'src/auth/jwt/strategies/jwt.strategy';
import { JwtForgotStrategy } from 'src/auth/jwt/strategies/jwt-forgot.strategy';
import { Schedule } from 'src/schedule/entity/schedule.entity';
import { Message } from 'src/message/entity/message.entity';
import { WaterHistory } from 'src/schedule/entity/water_history.entity';
import { ScheduleService } from 'src/schedule/service/schedule.service';
import { Food } from 'src/food/entity/food.entity';
import { FoodHistory } from 'src/food/entity/food_history.entity';
import { WeightHistory } from './entity/weight-history.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Otp,
      Schedule,
      Message,
      WaterHistory,
      Food,
      FoodHistory,
      WeightHistory,
    ]),
    MailerModule,
    JwtLoginModule,
    JwtForgotModule,
  ],
  providers: [
    UserService,
    JwtLoginStrategy,
    JwtForgotStrategy,
    ScheduleService,
  ],
  controllers: [UserController],
})
export class UserModule {}
