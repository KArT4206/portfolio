-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "problem" TEXT,
ADD COLUMN     "results" JSONB,
ADD COLUMN     "solution" TEXT[];
