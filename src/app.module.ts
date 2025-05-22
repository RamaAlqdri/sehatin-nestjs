import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { FoodModule } from './food/food.module';
import { ScheduleModule } from './schedule/schedule.module';
import { BotModule } from './bot/bot.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as path from 'path';
import { User } from './user/entity/user.entity';
import { Otp } from './auth/entity/otp.user.entity';
import { Admin } from './admin/entity/admin.entity';
import { Food } from './food/entity/food.entity';
import { Schedule } from './schedule/entity/schedule.entity';
import { Message } from './message/entity/message.entity';
import { WaterHistory } from './schedule/entity/water_history.entity';
import { FoodHistory } from './food/entity/food_history.entity';
import { WeightHistory } from './user/entity/weight-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          entities: [
            User,
            Otp,
            Admin,
            Food,
            Schedule,
            Message,
            WaterHistory,
            FoodHistory,
            WeightHistory,
          ],
          synchronize: true, // Sesuaikan dengan kebutuhan Anda
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: configService.get<string>('SMTP_SERVICE'),
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: configService.get<boolean>('SMTP_SECURE'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
          debug: true,
        },
        defaults: {
          from: configService.get<string>('DEFAULT_FROM'),
        },
        template: {
          dir: path.join(__dirname, '../src/auth/template'),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AdminModule,
    FoodModule,
    ScheduleModule,
    BotModule,
    MessageModule,
    AuthModule,
  ],
})
export class AppModule {}
