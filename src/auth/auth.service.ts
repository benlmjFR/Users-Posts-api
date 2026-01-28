/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth/auth.service.ts

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER (EMAIL + PASSWORD)
  // =========================
  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.usersService.createUser({
        email: dto.email,
        password: hashedPassword,
      });

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        message: 'User created',
        user,
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('REGISTER ERROR:', error);

      if ((error as any)?.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  // =========================
  // LOGIN (EMAIL + PASSWORD)
  // =========================
  async login(dto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(dto.email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.password) {
        throw new UnauthorizedException(
          'This account uses Google authentication',
        );
      }

      const passwordValid = await bcrypt.compare(dto.password, user.password);

      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      throw err;
    }
  }

  // =========================
  // LOGIN / REGISTER (GOOGLE OAUTH)
  // =========================
  async loginWithGoogle(profile: {
    email: string;
    googleId: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    const user = await this.usersService.upsertGoogleUser({
      email: profile.email,
      googleId: profile.googleId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}