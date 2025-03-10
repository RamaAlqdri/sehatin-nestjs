import { Otp } from 'src/auth/entity/otp.user.entity';
import { Message } from 'src/message/entity/message.entity';
import { Schedule } from 'src/schedule/entity/schedule.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Activity {
  SEDENTARY = 'sedentary',
  LIGHT = 'female',
  MODERATELY = 'moderately',
  HEAVY = 'heavy',
}

export enum Goal {
  WEIGHT = 'weight',
  MUSCLE = 'muscle',
  HEALTH = 'health',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => Otp, (otp) => otp.user)
  otp: Otp;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bmi: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bmr: number;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'enum', enum: Activity, nullable: true })
  activity: Activity;

  @Column({ type: 'enum', enum: Goal, nullable: true })
  goal: Goal;

  @OneToMany(() => Schedule, (schedule) => schedule.user)
  schedules: Schedule[];

  @OneToMany(() => Message, (message) => message.user)
  message: Message[];
}
