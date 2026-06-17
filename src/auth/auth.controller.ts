import { Controller, Post, Put, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Put('fcm-token')
  @UseGuards(AuthGuard('jwt'))
  saveFcmToken(@Request() req, @Body('token') token: string) {
    return this.authService.saveFcmToken(req.user.id, token);
  }
}
