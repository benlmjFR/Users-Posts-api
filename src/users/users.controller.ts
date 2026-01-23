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


// Protect this route with JWT authentication
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /**
   * READ /users/profile
   */
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  /**
   * GET /users?page=1&limit=10
   */
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  getAllUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.getAllUsers(+page, +limit);
  }

  /**
   * GET /users/:id
   */
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }

  /**
   * PATCH /users/:id/role
   */
  @Patch(':id/role')
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
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
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
