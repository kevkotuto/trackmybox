import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
