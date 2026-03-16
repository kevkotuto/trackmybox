import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MovesService } from './moves.service';
import { CreateMoveDto } from './dto/create-move.dto';
import { UpdateMoveDto } from './dto/update-move.dto';

@ApiTags('Moves')
@Controller('api/v1/moves')
export class MovesController {
  constructor(private readonly service: MovesService) {}

  @Get()
  @ApiOperation({ summary: 'List all moves' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one move' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a move' })
  create(@Body() dto: CreateMoveDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a move' })
  update(@Param('id') id: string, @Body() dto: UpdateMoveDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a move' })
  start(@Param('id') id: string) {
    return this.service.start(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a move' })
  complete(@Param('id') id: string) {
    return this.service.complete(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a move' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
