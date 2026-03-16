import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moveId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDestination?: boolean;
}
