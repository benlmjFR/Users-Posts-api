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

  // REGISTER
  async register(dto: RegisterDto) {
    // SALTROUNDS = 10
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
      throw new ConflictException('Email already exists');
    }
  }

  // LOGIN
  async login(dto: LoginDto) {
  try {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new Error('User password is null');
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
}
