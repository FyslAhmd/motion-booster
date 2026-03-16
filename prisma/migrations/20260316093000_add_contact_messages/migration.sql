-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company_name" TEXT,
    "mobile" TEXT NOT NULL,
    "query_details" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'CONTACT_US',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- CreateIndex
CREATE INDEX "contact_messages_is_read_idx" ON "contact_messages"("is_read");
