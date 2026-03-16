import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Container } from '../containers/container.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  caption: string;

  @Column()
  containerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Container, (container) => container.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'containerId' })
  container: Container;
}
