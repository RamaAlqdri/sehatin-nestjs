import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entity/admin.entity';
import { JwtLoginModule } from 'src/auth/jwt/module/jwt.module';
import { AdminSeeder } from './seed/admin.seed';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Admin]), JwtLoginModule],
  providers: [AdminSeeder],
})
export class AdminModule {}
