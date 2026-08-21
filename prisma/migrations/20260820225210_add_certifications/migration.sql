-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "description" TEXT,
    "issueDate" TIMESTAMPTZ(3),
    "expiresDate" TIMESTAMPTZ(3),
    "certificateMediaId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Certification_published_deletedAt_displayOrder_idx" ON "Certification"("published", "deletedAt", "displayOrder");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_certificateMediaId_fkey" FOREIGN KEY ("certificateMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
