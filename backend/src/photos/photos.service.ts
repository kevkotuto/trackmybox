import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly repo: Repository<Photo>,
  ) {}

  async findAll(containerId?: string): Promise<Photo[]> {
    const where: any = {};
    if (containerId) where.containerId = containerId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Photo> {
    const photo = await this.repo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException(`Photo ${id} not found`);
    return photo;
  }

  async create(dto: CreatePhotoDto): Promise<Photo> {
    const photo = this.repo.create(dto);
    return this.repo.save(photo);
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    await this.repo.remove(photo);
  }
}
