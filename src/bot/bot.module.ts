import { Module } from '@nestjs/common';
import { BotController } from './controller/controller.controller';

import { BotService } from './service/bot.service';

@Module({
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
