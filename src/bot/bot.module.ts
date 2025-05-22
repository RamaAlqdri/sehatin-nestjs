import { Module } from '@nestjs/common';
import { BotController } from './controller/controller.controller';
// import { HttpModule } from '@nestjs/axios';

import { BotService } from './service/bot.service';

@Module({
  // imports: [HttpModule],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
