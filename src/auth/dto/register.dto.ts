import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/* eslint-disable @typescript-eslint/no-unsafe-call */
export class RegisterDto {
  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
