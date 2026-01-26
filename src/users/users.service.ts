import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';

const publicUserSelect = {
  id: true,
  email: true,
  description: true,
  address: true,
  role: true,
  phone: true,
  firstName: true,
  lastName: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // UPDATE ROLE
  // =========================
  async updateUserRole(userId: number, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  // =========================
  // READ ALL
  // =========================
  getAllUsers(page = 1, limit = 10) {
    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: publicUserSelect,
    });
  }

  // =========================
  // READ ONE
  // =========================
  async getUser(id: number) {
    return this.findOrFail({ id });
  }

  // =========================
  // FIND BY EMAIL
  // =========================
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // =========================
  // CREATE (EMAIL / PASSWORD)
  // =========================
  async createUser(data: Prisma.UserCreateInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      return await this.prisma.user.create({
        data,
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // =========================
  // UPDATE
  // =========================
  async updateUser(id: number, data: Prisma.UserUpdateInput) {
    await this.findOrFail({ id });

    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email as string },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: publicUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // =========================
  // DELETE
  // =========================
  async deleteUser(id: number) {
    await this.findOrFail({ id });

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });
  }

  // =========================
  // VALIDATE USER (JWT)
  // =========================
  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // =========================
  // GOOGLE OAUTH UPSERT
  // =========================
  async upsertGoogleUser(data: {
    email: string;
    googleId: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    return this.prisma.user.upsert({
      where: { email: data.email },
      update: {
        googleId: data.googleId,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
      },
      create: {
        email: data.email,
        googleId: data.googleId,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
        password: null,
        role: Role.USER,
      },
      select: publicUserSelect,
    });
  }

  // =========================
  // PRIVATE
  // =========================
  private async findOrFail(where: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.user.findUnique({
      where,
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}