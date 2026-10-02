import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
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

  @RelationId((r: Room) => r.move)
  moveId: string;

  @ManyToOne('Move', 'rooms', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'moveId' })
  move: any;

  @Column({ default: false })
  isDestination: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
