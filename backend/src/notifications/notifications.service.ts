import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationToken } from './notification-token.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationToken)
    private readonly repo: Repository<NotificationToken>,
  ) {}

  async registerToken(householdId: string, deviceId: string | undefined, expoPushToken: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { expoPushToken } });
    if (existing) {
      existing.householdId = householdId;
      existing.deviceId = deviceId ?? existing.deviceId;
      await this.repo.save(existing);
    } else {
      await this.repo.save(this.repo.create({ householdId, deviceId, expoPushToken }));
    }
  }

  async sendToHousehold(householdId: string, title: string, body: string): Promise<void> {
    const tokens = await this.repo.find({ where: { householdId } });
    if (!tokens.length) return;

    const messages = tokens.map((t) => ({
      to: t.expoPushToken,
      sound: 'default',
      title,
      body,
      data: { householdId },
    }));

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });
    } catch {
      // Non-blocking — notification failures must not crash the request
    }
  }
}
