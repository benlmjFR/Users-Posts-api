-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "pdfs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "video" TEXT;
