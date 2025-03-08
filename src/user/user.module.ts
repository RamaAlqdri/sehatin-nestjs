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

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Otp]),
    MailerModule,
    JwtLoginModule,
    JwtForgotModule,
  ],
  providers: [UserService, JwtLoginStrategy, JwtForgotStrategy],
  controllers: [UserController],
})
export class UserModule {}
