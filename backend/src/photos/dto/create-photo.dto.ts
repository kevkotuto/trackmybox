import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhotoDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty()
  @IsUUID()
  containerId: string;
}
