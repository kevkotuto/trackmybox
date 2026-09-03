import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('notifications')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(@Request() req: any, @Body() body: { expoPushToken: string }) {
    return this.notificationsService.registerToken(
      req.user.householdId,
      req.user.sub,
      body.expoPushToken,
    );
  }
}
