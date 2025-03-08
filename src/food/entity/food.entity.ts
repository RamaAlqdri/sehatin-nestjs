import { Schedule } from 'src/schedule/entity/schedule.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('food')
export class Food {
  @PrimaryGeneratedColumn('uuid')
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

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Schedule, (schedule) => schedule.food)
  schedules: Schedule[];
}
