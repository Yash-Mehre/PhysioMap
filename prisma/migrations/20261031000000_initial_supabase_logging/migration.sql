-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('debug', 'info', 'warn', 'error');

-- CreateTable
CREATE TABLE "AppLog" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'info',
    "source" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppLog_createdAt_idx" ON "AppLog"("createdAt");

-- CreateIndex
CREATE INDEX "AppLog_source_event_idx" ON "AppLog"("source", "event");

