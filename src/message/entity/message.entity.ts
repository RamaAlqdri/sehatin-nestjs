import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: Sender, default: Sender.USER })
  sender: Sender;

  @ManyToOne(() => User, (user) => user.message)
  user: User;
}
