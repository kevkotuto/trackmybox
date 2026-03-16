import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';

@ApiTags('Photos')
@Controller('api/v1/photos')
export class PhotosController {
  constructor(private readonly service: PhotosService) {}

  @Get()
  @ApiOperation({ summary: 'List all photos' })
  @ApiQuery({ name: 'containerId', required: false })
  findAll(@Query('containerId') containerId?: string) {
    return this.service.findAll(containerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a photo' })
  create(@Body() dto: CreatePhotoDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a photo' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
