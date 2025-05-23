import { Schedule } from 'src/schedule/entity/schedule.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { FoodHistory } from './food_history.entity';

@Entity('food')
export class Food {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calories: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  protein: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fat: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carb: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fiber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  serving_amount: number;

  @Column({ nullable: true })
  serving_unit: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Schedule, (schedule) => schedule.food)
  schedules: Schedule[];

  @OneToMany(() => FoodHistory, (food_history) => food_history.food)
  food_history: FoodHistory[];
}
