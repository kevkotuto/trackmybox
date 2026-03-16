import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ContainerType,
  ContainerStatus,
  ContainerPriority,
} from '../container.entity';

export class CreateContainerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ContainerType })
  @IsOptional()
  @IsEnum(ContainerType)
  type?: ContainerType;

  @ApiPropertyOptional({ enum: ContainerStatus })
  @IsOptional()
  @IsEnum(ContainerStatus)
  status?: ContainerStatus;

  @ApiPropertyOptional({ enum: ContainerPriority })
  @IsOptional()
  @IsEnum(ContainerPriority)
  priority?: ContainerPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinationRoomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moveId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isThirdParty?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thirdPartyOwner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  returnDate?: string;
}
