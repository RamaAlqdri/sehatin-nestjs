import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
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

  @Post('')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('admin', 'user')
  async create(
    @Req() req: any,
    @Body() createMessage: CreateMessageDto,
    @Query('userId') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.messageService.createMessage(id, createMessage);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Message Sended Successfully',
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
