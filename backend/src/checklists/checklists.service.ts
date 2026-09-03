import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistItem } from './checklist-item.entity';

@Injectable()
export class ChecklistsService {
  constructor(
    @InjectRepository(ChecklistItem)
    private readonly repo: Repository<ChecklistItem>,
  ) {}

  async findByContainer(containerId: string): Promise<ChecklistItem[]> {
    return this.repo.find({
      where: { containerId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(containerId: string, label: string): Promise<ChecklistItem> {
    const count = await this.repo.count({ where: { containerId } });
    const item = this.repo.create({ containerId, label, order: count });
    return this.repo.save(item);
  }

  async toggle(id: string, isDone: boolean): Promise<ChecklistItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Checklist item not found');
    item.isDone = isDone;
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Checklist item not found');
    await this.repo.remove(item);
  }
}
