import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChecklistsService } from './checklists.service';

@ApiTags('checklist')
@Controller('api/v1')
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get('containers/:containerId/checklist')
  getByContainer(@Param('containerId') containerId: string) {
    return this.checklistsService.findByContainer(containerId);
  }

  @Post('containers/:containerId/checklist')
  create(
    @Param('containerId') containerId: string,
    @Body() body: { label: string },
  ) {
    return this.checklistsService.create(containerId, body.label);
  }

  @Patch('checklist/:id')
  toggle(@Param('id') id: string, @Body() body: { isDone: boolean }) {
    return this.checklistsService.toggle(id, body.isDone);
  }

  @Delete('checklist/:id')
  remove(@Param('id') id: string) {
    return this.checklistsService.remove(id);
  }
}
