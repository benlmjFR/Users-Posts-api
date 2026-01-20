// supabase.service.ts
import { Injectable } from '@nestjs/common';
import { supabase } from '../../supabase/supabase.client';

@Injectable()
export class SupabaseService {
  async uploadFile(
    bucket: string,
    path: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
