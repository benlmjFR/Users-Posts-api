import { MediaType } from "@prisma/client";

export class UpdatePostMediaDto {
  name?: string;
  type?: MediaType;
}