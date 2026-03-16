import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Items')
@Controller('api/v1/items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List all items' })
  @ApiQuery({ name: 'containerId', required: false })
  findAll(@Query('containerId') containerId?: string) {
    return this.service.findAll(containerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an item' })
  create(@Body() dto: CreateItemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item' })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
