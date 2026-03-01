-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "file_name" TEXT,
ADD COLUMN     "file_size" INTEGER,
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "message_type" "MessageType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "mime_type" TEXT;
