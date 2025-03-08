import { Injectable } from '@nestjs/common';
import { Message } from '../entity/message.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createMessage(
    userId: string,
    request: CreateMessageDto,
  ): Promise<Message> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newMessage = this.messageRepository.create({
        ...request,
        user,
      });

      await this.messageRepository.save(newMessage);
      return newMessage;
    } catch (error) {
      throw error;
    }
  }

  async getAllMessageByUserId(userId: string): Promise<Message[]> {
    try {
      return await this.messageRepository.find({
        where: { user: { id: userId } },
      });
    } catch (error) {
      throw error;
    }
  }
}
