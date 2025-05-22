import { Injectable } from '@nestjs/common';
import { Message, Sender } from '../entity/message.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { botResponse } from 'src/common/bot_response';
import { BotService } from 'src/bot/service/bot.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly botService: BotService,
  ) {}

  async createDummyMessage(
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

      const randomBotResponse =
        botResponse[Math.floor(Math.random() * botResponse.length)];

      // Buat respons otomatis dari bot
      const botMessage = this.messageRepository.create({
        content: randomBotResponse,
        user, // Tetap terkait dengan user yang sama
        sender: Sender.BOT, // Tambahkan properti sender untuk menandai pesan dari bot
      });
      await this.messageRepository.save(botMessage);

      return newMessage;
    } catch (error) {
      throw error;
    }
  }

  async generateMessage(
    userId: string,
    request: CreateMessageDto,
  ): Promise<Message> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['weight_history'],
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Buat pesan dari user
      const newMessage = this.messageRepository.create({
        ...request,
        user,
      });

      // remove id, password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, password, email, ...userWithoutId } = user;

      // Gunakan BotService untuk mendapatkan respons bot
      const promptWithUserData = `content:${request.content}\n\nData Saya: ${JSON.stringify(userWithoutId)}\n\nData tadi hanya pendukung jika dibutuhkan, jawab saja yang content;Gunakan Bahasa Indosia;Penjelasan Cukup 1 Paragraf Saja`;
      const botResponse =
        await this.botService.generateResponse(promptWithUserData);

      // console.log(promptWithUserData);
      // console.log(botResponse);
      // Buat respons otomatis dari bot
      await this.messageRepository.save(newMessage);
      const botMessage = this.messageRepository.create({
        content: botResponse, // Gunakan respons dari BotService
        user, // Tetap terkait dengan user yang sama
        sender: Sender.BOT, // Tandai pesan sebagai berasal dari bot
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
