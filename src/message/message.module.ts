import { Module } from '@nestjs/common';
import { MessageController } from './controller/message.controller';

import { MessageService } from './service/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';
import { User } from 'src/user/entity/user.entity';
import { BotService } from 'src/bot/service/bot.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User])],
  controllers: [MessageController],
  providers: [MessageService, BotService],
})
export class MessageModule {}
