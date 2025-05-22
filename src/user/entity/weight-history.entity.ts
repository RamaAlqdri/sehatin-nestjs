import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('weight_history')
export class WeightHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @ManyToOne(() => User, (user) => user.weight_history)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
