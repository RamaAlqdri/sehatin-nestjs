import { Injectable } from '@nestjs/common';
import { Message, Sender } from '../entity/message.entity';
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

      // Buat pesan dari user
      const newMessage = this.messageRepository.create({
        ...request,
        user,
      });

      await this.messageRepository.save(newMessage);

      // Buat respons otomatis dari bot
      const botMessage = this.messageRepository.create({
        content: `Halo, terima kasih atas pesan Anda!`,
        user, // Tetap terkait dengan user yang sama
        sender: Sender.BOT, // Tambahkan properti sender untuk menandai pesan dari bot
      });
      await this.messageRepository.save(botMessage);

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
