import { IsString, IsEnum } from 'class-validator';
import { Sender } from '../entity/message.entity';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsEnum(Sender, {
    message: `Invalid sender. Must be one of the following values: ${Object.values(Sender).join(', ')}`,
  })
  sender: Sender;
}
