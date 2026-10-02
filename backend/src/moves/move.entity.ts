import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Container } from '../containers/container.entity';
import { Room } from '../rooms/room.entity';

export enum MoveStatus {
  PREPARATION = 'preparation',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('moves')
export class Move {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', default: MoveStatus.PREPARATION })
  status: MoveStatus;

  @Column({ nullable: true })
  fromAddress: string;

  @Column({ nullable: true })
  toAddress: string;

  @Column({ type: 'datetime', nullable: true })
  moveDate: Date;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  vehicleType: string;

  @Column({ type: 'float', nullable: true })
  estimatedTotalWeight: number;

  @Column({ type: 'text', nullable: true })
  contactPersons: string; // JSON-serialized: [{ name, phone? }]

  @OneToMany(() => Container, (c) => c.move)
  containers: Container[];

  @OneToMany(() => Room, (r) => r.move)
  rooms: Room[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
