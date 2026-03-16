import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
  ) {}

  async findAll(containerId?: string): Promise<Item[]> {
    const where: any = {};
    if (containerId) where.containerId = containerId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return item;
  }

  async create(dto: CreateItemDto): Promise<Item> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
