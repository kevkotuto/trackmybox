import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ContainersModule } from './containers/containers.module';
import { ItemsModule } from './items/items.module';
import { MovesModule } from './moves/moves.module';
import { RoomsModule } from './rooms/rooms.module';
import { PhotosModule } from './photos/photos.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'trackmybox.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ContainersModule,
    ItemsModule,
    MovesModule,
    RoomsModule,
    PhotosModule,
    ChecklistsModule,
    AuthModule,
    NotificationsModule,
  ],
})
export class AppModule {}
