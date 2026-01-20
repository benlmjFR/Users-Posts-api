/*
  Warnings:

  - You are about to drop the column `pdfs` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `PostAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostVideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PDF', 'VIDEO');

-- DropForeignKey
ALTER TABLE "PostAttachment" DROP CONSTRAINT "PostAttachment_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostVideo" DROP CONSTRAINT "PostVideo_postId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "pdfs",
DROP COLUMN "video";

-- DropTable
DROP TABLE "PostAttachment";

-- DropTable
DROP TABLE "PostVideo";

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
