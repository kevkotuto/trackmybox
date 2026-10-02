import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notification_tokens')
export class NotificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  householdId: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ unique: true })
  expoPushToken: string;

  @CreateDateColumn()
  createdAt: Date;
}
