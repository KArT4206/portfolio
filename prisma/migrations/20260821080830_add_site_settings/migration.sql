-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "funModeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "matrixInteractionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ghostEnabled" BOOLEAN NOT NULL DEFAULT true,
    "arcadeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "robotEnabled" BOOLEAN NOT NULL DEFAULT true,
    "explorerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "terminalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "idleEventsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundDefaultOn" BOOLEAN NOT NULL DEFAULT false,
    "maxWarpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
