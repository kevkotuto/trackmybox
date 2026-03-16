import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Container } from './container.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(Container)
    private readonly repo: Repository<Container>,
  ) {}

  async findAll(filters: {
    moveId?: string;
    status?: string;
    roomId?: string;
    priority?: string;
  }): Promise<Container[]> {
    const where: any = {};
    if (filters.moveId) where.moveId = filters.moveId;
    if (filters.status) where.status = filters.status;
    if (filters.roomId) where.roomId = filters.roomId;
    if (filters.priority) where.priority = filters.priority;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Container> {
    const container = await this.repo.findOne({
      where: { id },
      relations: ['items', 'photos'],
    });
    if (!container) throw new NotFoundException(`Container ${id} not found`);
    return container;
  }

  async findByQrCode(qrCodeData: string): Promise<Container> {
    const container = await this.repo.findOne({
      where: { qrCodeData },
      relations: ['items', 'photos'],
    });
    if (!container)
      throw new NotFoundException(`Container with QR ${qrCodeData} not found`);
    return container;
  }

  async getStats(moveId?: string) {
    const where: any = {};
    if (moveId) where.moveId = moveId;

    const total = await this.repo.count({ where });
    const scanned = await this.repo.count({
      where: { ...where, isScannedOnArrival: true },
    });
    const missing = total - scanned;
    const percentage = total > 0 ? Math.round((scanned / total) * 100) : 0;

    return { total, scanned, missing, percentage };
  }

  async create(dto: CreateContainerDto): Promise<Container> {
    const container = this.repo.create({
      ...dto,
      qrCodeData: uuidv4(),
    });
    return this.repo.save(container);
  }

  async update(id: string, dto: UpdateContainerDto): Promise<Container> {
    const container = await this.findOne(id);
    Object.assign(container, dto);
    return this.repo.save(container);
  }

  async markScanned(id: string): Promise<Container> {
    const container = await this.findOne(id);
    container.isScannedOnArrival = true;
    container.scannedAt = new Date();
    return this.repo.save(container);
  }

  async remove(id: string): Promise<void> {
    const container = await this.findOne(id);
    await this.repo.remove(container);
  }
}
