import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Move } from './move.entity';
import { MovesService } from './moves.service';
import { MovesController } from './moves.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Move])],
  controllers: [MovesController],
  providers: [MovesService],
  exports: [MovesService],
})
export class MovesModule {}
