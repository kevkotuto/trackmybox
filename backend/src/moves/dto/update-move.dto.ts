import { PartialType } from '@nestjs/swagger';
import { CreateMoveDto } from './create-move.dto';

export class UpdateMoveDto extends PartialType(CreateMoveDto) {}
