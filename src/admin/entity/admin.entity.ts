import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;
}
