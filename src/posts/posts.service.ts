import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { Multer } from 'multer';


@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE POST
  async create(userId: number, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        published: dto.published ?? false,
        authorId: userId,
      },
    });
  }

  // FIND ALL PUBLISHED
  async findAll() {
    return this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: { id: true, email: true },
        },
      },
    });
  }

  // FIND POSTS BY USER
  async findByUser(userId: number) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
    });
  }

  // UPDATE POST
  async update(postId: number, userId: number, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not your post');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: dto,
    });
  }

  // 5️⃣ DELETE POST
  async remove(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Not your post');
    }

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }

  // UPLOAD MEDIA (placeholder)
  async uploadMedia(
    postId: number,
    files: {
      pdfs?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    // 👉 HERE WE LINK SUPABASE Storage
    return {
      postId,
      pdfs: files.pdfs?.length ?? 0,
      video: files.video?.length ?? 0,
    };
  }
}

