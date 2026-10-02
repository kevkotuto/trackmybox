import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MoveStatus } from '../move.entity';

export class CreateMoveDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: MoveStatus })
  @IsOptional()
  @IsEnum(MoveStatus)
  status?: MoveStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  moveDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedTotalWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPersons?: string;
}
