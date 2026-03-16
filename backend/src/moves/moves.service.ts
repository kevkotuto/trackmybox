import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Move, MoveStatus } from './move.entity';
import { CreateMoveDto } from './dto/create-move.dto';
import { UpdateMoveDto } from './dto/update-move.dto';

@Injectable()
export class MovesService {
  constructor(
    @InjectRepository(Move)
    private readonly repo: Repository<Move>,
  ) {}

  async findAll(): Promise<Move[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Move> {
    const move = await this.repo.findOne({ where: { id } });
    if (!move) throw new NotFoundException(`Move ${id} not found`);
    return move;
  }

  async create(dto: CreateMoveDto): Promise<Move> {
    const move = this.repo.create(dto);
    return this.repo.save(move);
  }

  async update(id: string, dto: UpdateMoveDto): Promise<Move> {
    const move = await this.findOne(id);
    Object.assign(move, dto);
    return this.repo.save(move);
  }

  async start(id: string): Promise<Move> {
    const move = await this.findOne(id);
    move.status = MoveStatus.ACTIVE;
    move.startedAt = new Date();
    return this.repo.save(move);
  }

  async complete(id: string): Promise<Move> {
    const move = await this.findOne(id);
    move.status = MoveStatus.COMPLETED;
    move.completedAt = new Date();
    return this.repo.save(move);
  }

  async remove(id: string): Promise<void> {
    const move = await this.findOne(id);
    await this.repo.remove(move);
  }
}
