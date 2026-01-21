import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SupabaseService } from '../common/supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, SupabaseService, PrismaService]
})
export class PostsModule {}
