import { Body, Controller, Post } from '@nestjs/common';
import { BotService } from '../service/bot.service';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('generate')
  async generateChat(@Body() body: { prompt: string }) {
    return this.botService.generateResponse(body.prompt);
  }
}
