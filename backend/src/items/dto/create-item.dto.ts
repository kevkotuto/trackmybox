import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @ApiProperty()
  @IsUUID()
  containerId: string;
}
