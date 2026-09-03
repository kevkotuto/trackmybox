import { Controller, Post, Get, Delete, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('household')
  createHousehold(@Body() body: { name: string; deviceName: string; pin: string }) {
    return this.authService.createHousehold(body.name, body.deviceName, body.pin);
  }

  @Post('join')
  join(@Body() body: { code: string; deviceName: string; pin: string }) {
    return this.authService.joinHousehold(body.code, body.deviceName, body.pin);
  }

  @Post('login')
  login(@Body() body: { code: string; pin: string }) {
    return this.authService.loginDevice(body.code, body.pin);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-pin')
  verifyPin(@Request() req: any, @Body() body: { pin: string }) {
    return this.authService.verifyPin(req.user.sub, body.pin);
  }

  @UseGuards(JwtAuthGuard)
  @Get('household/devices')
  getDevices(@Request() req: any) {
    return this.authService.getDevices(req.user.householdId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('household/me')
  getHousehold(@Request() req: any) {
    return this.authService.getHousehold(req.user.householdId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('household')
  deleteHousehold(@Request() req: any) {
    return this.authService.deleteHousehold(req.user.householdId);
  }
}
