import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly repo: Repository<Room>,
  ) {}

  async findAll(moveId?: string): Promise<Room[]> {
    const where: any = {};
    if (moveId) where.moveId = moveId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.repo.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    return room;
  }

  async create(dto: CreateRoomDto): Promise<Room> {
    const room = this.repo.create(dto);
    return this.repo.save(room);
  }

  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    Object.assign(room, dto);
    return this.repo.save(room);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    await this.repo.remove(room);
  }
}
