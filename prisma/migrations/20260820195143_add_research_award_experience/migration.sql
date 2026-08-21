-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PRESENTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Research" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "authors" TEXT[],
    "conference" TEXT,
    "status" "ResearchStatus" NOT NULL DEFAULT 'PUBLISHED',
    "year" INTEGER,
    "doi" TEXT,
    "paperUrl" TEXT,
    "metrics" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchAttachment" (
    "id" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "AttachmentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "detail" TEXT,
    "year" INTEGER,
    "certificateMediaId" TEXT,
    "certificateUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMPTZ(3),
    "endDate" TIMESTAMPTZ(3),
    "bullets" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Research_published_deletedAt_displayOrder_idx" ON "Research"("published", "deletedAt", "displayOrder");

-- CreateIndex
CREATE INDEX "Research_featured_idx" ON "Research"("featured");

-- CreateIndex
CREATE INDEX "ResearchAttachment_researchId_displayOrder_idx" ON "ResearchAttachment"("researchId", "displayOrder");

-- CreateIndex
CREATE INDEX "Award_published_deletedAt_displayOrder_idx" ON "Award"("published", "deletedAt", "displayOrder");

-- CreateIndex
CREATE INDEX "Experience_published_deletedAt_displayOrder_idx" ON "Experience"("published", "deletedAt", "displayOrder");

-- AddForeignKey
ALTER TABLE "ResearchAttachment" ADD CONSTRAINT "ResearchAttachment_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAttachment" ADD CONSTRAINT "ResearchAttachment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_certificateMediaId_fkey" FOREIGN KEY ("certificateMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
