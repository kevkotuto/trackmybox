import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Container } from './container.entity';
import { ContainersService } from './containers.service';
import { ContainersController } from './containers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Container])],
  controllers: [ContainersController],
  providers: [ContainersService],
  exports: [ContainersService],
})
export class ContainersModule {}
