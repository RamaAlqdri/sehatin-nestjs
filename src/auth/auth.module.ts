import { Module } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';
import { Otp } from './entity/otp.user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtForgotModule } from './jwt/module/jwt-forgot.module';
import { JwtLoginModule } from './jwt/module/jwt.module';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthUserService } from './service/auth.user.service';
import { AuthUserController } from './controller/auth.user.controller';
import { OtpService } from './service/otp.service';
import { LocalStrategy } from './jwt/strategies/local.strategy';
import { JwtLoginStrategy } from './jwt/strategies/jwt.strategy';
import { JwtForgotStrategy } from './jwt/strategies/jwt-forgot.strategy';
import { GoogleStrategy } from './google/google.strategy';
import { Admin } from 'src/admin/entity/admin.entity';
import { AuthAdminService } from './service/auth.admin.service';
import { AuthAdminController } from './controller/auth.admin.controller';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    UserModule,
    JwtLoginModule,
    JwtForgotModule,
    TypeOrmModule.forFeature([User, Otp, Admin]),
  ],
  providers: [
    {
      provide: 'AUTH_USER_SERVICE',
      useClass: AuthUserService,
    },
    {
      provide: 'AUTH_ADMIN_SERVICE',
      useClass: AuthAdminService,
    },
    OtpService,
    LocalStrategy,
    JwtLoginStrategy,
    JwtForgotStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthUserController, AuthAdminController],
})
export class AuthModule {}
