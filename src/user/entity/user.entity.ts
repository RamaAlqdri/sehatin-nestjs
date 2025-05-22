import { Otp } from 'src/auth/entity/otp.user.entity';
import { FoodHistory } from 'src/food/entity/food_history.entity';
import { Message } from 'src/message/entity/message.entity';

import { Schedule } from 'src/schedule/entity/schedule.entity';
import { WaterHistory } from 'src/schedule/entity/water_history.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WeightHistory } from './weight-history.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Activity {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
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

  // @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  // weight: number;

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 55.0 })
  weight_target: number;

  @OneToMany(() => Schedule, (schedule) => schedule.user)
  schedules: Schedule[];

  @OneToMany(() => FoodHistory, (food_history) => food_history.user)
  food_history: FoodHistory[];

  @OneToMany(() => WeightHistory, (weight_history) => weight_history.user)
  weight_history: WeightHistory[];

  @OneToMany(() => Message, (message) => message.user)
  message: Message[];

  @OneToMany(() => WaterHistory, (water) => water.user)
  water_history: WaterHistory[];
}
