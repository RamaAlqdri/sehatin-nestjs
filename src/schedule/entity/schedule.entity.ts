import { Food } from 'src/food/entity/food.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  calories_burned: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  water_consum: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  calories_target: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  water_target: number;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  is_completed: boolean;

  @ManyToOne(() => Food, (food) => food.schedules)
  food: Food;

  @ManyToOne(() => User, (user) => user.schedules)
  user: User;
}
