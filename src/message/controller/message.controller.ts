import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { Roles } from 'src/auth/jwt/decorators/roles.decorator';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { RoleGuard } from 'src/auth/jwt/guards/roles.guard';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { CreateMessageDto } from '../dto/create-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':userId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async create(
    @Body() createMessage: CreateMessageDto,
    @Param('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.messageService.createMessage(userId, createMessage);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Message Created Successfully',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async getMessagesByUserId(
    @Param('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const messages = await this.messageService.getAllMessageByUserId(userId);
      return new ResponseWrapper(HttpStatus.OK, 'Messages Found', messages);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
}
