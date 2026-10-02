import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  householdId: string;

  @Column()
  deviceName: string;

  @Column()
  pin: string; // bcrypt hash

  @CreateDateColumn()
  createdAt: Date;
}
