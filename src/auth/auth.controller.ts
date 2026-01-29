import { Body, Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

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
  async googleCallback(@Req() req: any, @Res() res: Response): Promise<void> {
    const { access_token } = await this.authService.loginWithGoogle(req.user);

    // Cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      path: '/',
    });
  if (!process.env.FRONT_CALLBACK_URL) {
  throw new Error('FRONT_CALLBACK_URL is not defined');
}

    // Redirection to front profile pae
    res.redirect(process.env.FRONT_CALLBACK_URL as string);
  }
}
