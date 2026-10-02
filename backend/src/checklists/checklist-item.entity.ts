import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Container } from '../containers/container.entity';

@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  containerId: string;

  @ManyToOne(() => Container, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'containerId' })
  container: Container;

  @Column()
  label: string;

  @Column({ default: false })
  isDone: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}
