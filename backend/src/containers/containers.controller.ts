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
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';

@ApiTags('Containers')
@Controller('api/v1/containers')
export class ContainersController {
  constructor(private readonly service: ContainersService) {}

  @Get()
  @ApiOperation({ summary: 'List all containers' })
  @ApiQuery({ name: 'moveId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'priority', required: false })
  findAll(
    @Query('moveId') moveId?: string,
    @Query('status') status?: string,
    @Query('roomId') roomId?: string,
    @Query('priority') priority?: string,
  ) {
    return this.service.findAll({ moveId, status, roomId, priority });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get container scan statistics' })
  @ApiQuery({ name: 'moveId', required: false })
  getStats(@Query('moveId') moveId?: string) {
    return this.service.getStats(moveId);
  }

  @Get('qr/:qrCodeData')
  @ApiOperation({ summary: 'Find container by QR code data' })
  findByQrCode(@Param('qrCodeData') qrCodeData: string) {
    return this.service.findByQrCode(qrCodeData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one container with items and photos' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a container' })
  create(@Body() dto: CreateContainerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a container' })
  update(@Param('id') id: string, @Body() dto: UpdateContainerDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/scan')
  @ApiOperation({ summary: 'Mark container as scanned on arrival' })
  markScanned(@Param('id') id: string) {
    return this.service.markScanned(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a container' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
