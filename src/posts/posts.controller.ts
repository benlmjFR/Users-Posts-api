import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';


interface AuthenticatedRequest extends Request {
  user: { id: number };
}

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // CREATE A POST
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.id, dto);
  }

  // UPLOAD PDF + VIDEO
  @Post(':id/media')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pdfs', maxCount: 10 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  upload(
    @Param('id', ParseIntPipe) postId: number,
    @UploadedFiles() files: { pdfs?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    return this.postsService.uploadMedia(postId, files);
  }

  // GET ALL POSTS
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  // SEE MY POSTS
  @Get('me')
  getMine(@Req() req: AuthenticatedRequest) {
    return this.postsService.findByUser(req.user.id);
  }

  // UPDATE A POST
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.update(id, req.user.id, dto);
  }

  // DELETE A POST
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.remove(id, req.user.id);
  }
}
