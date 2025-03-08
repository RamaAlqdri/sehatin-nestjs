import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  otp: string; // Store hashed OTP

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
