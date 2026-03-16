import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Container } from '../containers/container.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'decimal', nullable: true })
  estimatedValue: number;

  @Column({ default: false })
  isFragile: boolean;

  @Column()
  containerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Container, (container) => container.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'containerId' })
  container: Container;
}
