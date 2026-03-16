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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Rooms')
@Controller('api/v1/rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List all rooms' })
  @ApiQuery({ name: 'moveId', required: false })
  findAll(@Query('moveId') moveId?: string) {
    return this.service.findAll(moveId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a room' })
  create(@Body() dto: CreateRoomDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
