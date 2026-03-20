/*
  Warnings:

  - You are about to drop the `JourneySession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JourneySession";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GrindSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitedAt" DATETIME,
    "loopCount" INTEGER NOT NULL DEFAULT 0,
    "adsViewed" INTEGER NOT NULL DEFAULT 0,
    "videosWatched" INTEGER NOT NULL DEFAULT 0,
    "earnedCents" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GrindSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrivacySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "shareUsageData" BOOLEAN NOT NULL DEFAULT false,
    "shareInterests" BOOLEAN NOT NULL DEFAULT false,
    "personalizedAds" BOOLEAN NOT NULL DEFAULT false,
    "tier1BonusPaid" BOOLEAN NOT NULL DEFAULT false,
    "tier2BonusPaid" BOOLEAN NOT NULL DEFAULT false,
    "tier3BonusPaid" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PrivacySettings" ("id", "personalizedAds", "shareInterests", "shareUsageData", "updatedAt", "userId") SELECT "id", "personalizedAds", "shareInterests", "shareUsageData", "updatedAt", "userId" FROM "PrivacySettings";
DROP TABLE "PrivacySettings";
ALTER TABLE "new_PrivacySettings" RENAME TO "PrivacySettings";
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
