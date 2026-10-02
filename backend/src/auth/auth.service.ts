import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Household } from './household.entity';
import { Device } from './device.entity';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Household)
    private readonly householdRepo: Repository<Household>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async createHousehold(name: string, deviceName: string, pin: string | undefined) {
    if (!pin) throw new Error('PIN requis');
    if (!name) throw new Error('Nom du foyer requis');
    let code: string;
    let exists = true;
    do {
      code = generateCode();
      exists = !!(await this.householdRepo.findOne({ where: { code } }));
    } while (exists);

    const household = await this.householdRepo.save(
      this.householdRepo.create({ name, code }),
    );

    const pinHash = await bcrypt.hash(pin, 10);
    const device = await this.deviceRepo.save(
      this.deviceRepo.create({ householdId: household.id, deviceName, pin: pinHash }),
    );

    const token = this.jwtService.sign({
      sub: device.id,
      householdId: household.id,
    });

    return { code, householdId: household.id, token };
  }

  async joinHousehold(code: string, deviceName: string, pin: string) {
    const household = await this.householdRepo.findOne({ where: { code: code.toUpperCase() } });
    if (!household) throw new NotFoundException('Code de foyer invalide');

    const pinHash = await bcrypt.hash(pin, 10);
    const device = await this.deviceRepo.save(
      this.deviceRepo.create({ householdId: household.id, deviceName, pin: pinHash }),
    );

    const token = this.jwtService.sign({
      sub: device.id,
      householdId: household.id,
    });

    return { token, householdId: household.id };
  }

  async loginDevice(code: string, pin: string) {
    const household = await this.householdRepo.findOne({ where: { code: code.toUpperCase() } });
    if (!household) throw new NotFoundException('Code de foyer invalide');

    const devices = await this.deviceRepo.find({ where: { householdId: household.id } });
    for (const device of devices) {
      const valid = await bcrypt.compare(pin, device.pin);
      if (valid) {
        const token = this.jwtService.sign({
          sub: device.id,
          householdId: household.id,
        });
        return { token, householdId: household.id, code: household.code };
      }
    }
    throw new UnauthorizedException('Code ou PIN incorrect');
  }

  async verifyPin(deviceId: string, pin: string) {
    const device = await this.deviceRepo.findOne({ where: { id: deviceId } });
    if (!device) throw new UnauthorizedException('Appareil inconnu');

    const valid = await bcrypt.compare(pin, device.pin);
    if (!valid) throw new UnauthorizedException('PIN incorrect');

    const token = this.jwtService.sign({
      sub: device.id,
      householdId: device.householdId,
    });

    return { token };
  }

  async getDevices(householdId: string) {
    return this.deviceRepo.find({
      where: { householdId },
      select: ['id', 'deviceName', 'createdAt'],
      order: { createdAt: 'ASC' },
    });
  }

  async getHousehold(householdId: string) {
    const household = await this.householdRepo.findOne({ where: { id: householdId } });
    if (!household) throw new NotFoundException('Foyer introuvable');
    return household;
  }

  async deleteHousehold(householdId: string): Promise<void> {
    const household = await this.householdRepo.findOne({ where: { id: householdId } });
    if (!household) throw new NotFoundException('Foyer introuvable');

    // Delete all data in the right order (SQLite has no FK cascade across tables)
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      await qr.query(`DELETE FROM checklist_items`);
      await qr.query(`DELETE FROM photos`);
      await qr.query(`DELETE FROM items`);
      await qr.query(`DELETE FROM containers`);
      await qr.query(`DELETE FROM moves`);
      await qr.query(`DELETE FROM rooms`);
      await qr.query(`DELETE FROM notification_tokens`);
      await qr.query(`DELETE FROM devices WHERE householdId = ?`, [householdId]);
      await qr.query(`DELETE FROM households WHERE id = ?`, [householdId]);
      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
