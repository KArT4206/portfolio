-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT,
    "externalUrl" TEXT,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resume_isActive_deletedAt_idx" ON "Resume"("isActive", "deletedAt");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
