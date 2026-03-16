import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  moveId: string;

  @Column({ default: false })
  isDestination: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
