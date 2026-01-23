import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { Multer } from 'multer';
import { SupabaseService } from '../common/supabase/supabase.service';
import { UpdatePostMediaDto } from './dto/update-post-media.dto';


@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

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
        medias: true,
      },
    });
  }

  // FIND POSTS BY USER
  async findByUser(userId: number) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        medias: true
    },
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
  userId: number,
  files: {
    pdfs?: Express.Multer.File[];
    video?: Express.Multer.File[];
  },
) {
  const post = await this.prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) throw new NotFoundException('Post not found');
  if (post.authorId !== userId)
    throw new ForbiddenException('Not your post');

  const createdMedias = [];

  // PDFs
  for (const file of files.pdfs ?? []) {
    const path = `posts/${postId}/pdfs/${Date.now()}-${file.originalname}`;

    const publicUrl = await this.supabaseService.uploadFile(
      'posts-pdfs',
      path,
      file,
    );

    const media = await this.prisma.postMedia.create({
      data: {
        postId,
        type: 'PDF',
        url: publicUrl,
        name: file.originalname,
        size: file.size,
      },
    });

    createdMedias.push(media);
  }

  // VIDEO
  if (files.video?.[0]) {
    const file = files.video[0];
    const path = `posts/${postId}/video/${Date.now()}-${file.originalname}`;

    const publicUrl = await this.supabaseService.uploadFile(
      'posts-videos',
      path,
      file,
    );

    const media = await this.prisma.postMedia.create({
      data: {
        postId,
        type: 'VIDEO',
        url: publicUrl,
        name: file.originalname,
        size: file.size,
      },
    });

    createdMedias.push(media);
  }

  return createdMedias;
 }

 async removeMedia(mediaId: number, userId: number) {
  const media = await this.prisma.postMedia.findUnique({
    where: { id: mediaId },
    include: { post: true },
  });

  if (!media || media.post.authorId !== userId) {
    throw new ForbiddenException();
  }

  return this.prisma.postMedia.delete({
    where: { id: mediaId },
  });
 }
}


