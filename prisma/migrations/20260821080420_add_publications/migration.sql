-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "journal" TEXT,
    "publicationDate" TIMESTAMPTZ(3),
    "doi" TEXT,
    "url" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "abstract" TEXT,
    "keywords" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationAttachment" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "AttachmentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicationAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Publication_published_deletedAt_displayOrder_idx" ON "Publication"("published", "deletedAt", "displayOrder");

-- CreateIndex
CREATE INDEX "Publication_featured_idx" ON "Publication"("featured");

-- CreateIndex
CREATE INDEX "PublicationAttachment_publicationId_displayOrder_idx" ON "PublicationAttachment"("publicationId", "displayOrder");

-- AddForeignKey
ALTER TABLE "PublicationAttachment" ADD CONSTRAINT "PublicationAttachment_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationAttachment" ADD CONSTRAINT "PublicationAttachment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
