import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  // =========================
  // REDIRECT GOOGLE
  // =========================
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // 🔥 Redirection automatique vers Google
  }

  // =========================
  // GOOGLE CALLBACK
  // =========================
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any) {
    return this.authService.loginWithGoogle(req.user);
  }
}
