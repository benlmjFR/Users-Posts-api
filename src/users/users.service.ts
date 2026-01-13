import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const publicUserSelect = {
  id: true,
  email: true,
  description: true,
  address: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // READ ALL
  findAll(page = 1, limit = 10) {
    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: publicUserSelect,
    });
  }

  // READ ONE
  async findById(id: number) {
    return this.findOrFail({ id });
  }

  // CREATE
  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: publicUserSelect,
    });
  }

  // UPDATE
  async update(id: number, data: Prisma.UserUpdateInput) {
    await this.findOrFail({ id });

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  // DELETE
  async remove(id: number) {
    await this.findOrFail({ id });

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });
  }

  // PRIVATE
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
