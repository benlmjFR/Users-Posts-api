import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/roles/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /**
   * READ /users/profile
   */
  // Protect this route with JWT authentication
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  /**
   * GET /users?page=1&limit=10
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.getAllUsers(+page, +limit);
  }

  /**
   * GET /users/:id
   */
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }

  /**
   * PATCH /users/:id/role
   */
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateUserRole(id, dto.role as Role);
  }

  /**
   * PATCH /users/:id
   */
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, data);
  }

  /**
   * DELETE /users/:id
   */
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
