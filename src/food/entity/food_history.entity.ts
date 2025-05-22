import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Food } from './food.entity';
import { User } from 'src/user/entity/user.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  OTHER = 'other',
}

@Entity('food_history')
export class FoodHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: MealType, nullable: true })
  meal_type: MealType;

  @ManyToOne(() => Food, (food) => food.schedules)
  food: Food;

  @ManyToOne(() => User, (user) => user.food_history)
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  serving_amount: number;

  @Column({ nullable: true })
  serving_unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  calories: number;
}
