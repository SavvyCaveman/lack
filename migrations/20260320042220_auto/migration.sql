-- CreateTable
CREATE TABLE "MarketingProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL DEFAULT '',
    "gender" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "interests" TEXT NOT NULL DEFAULT '[]',
    "brandAffinities" TEXT NOT NULL DEFAULT '[]',
    "purchaseIntent" TEXT NOT NULL DEFAULT '[]',
    "incomeRange" TEXT NOT NULL DEFAULT '',
    "employmentStatus" TEXT NOT NULL DEFAULT '',
    "dataConsentLevel" INTEGER NOT NULL DEFAULT 0,
    "profileScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "videoTheme" TEXT NOT NULL,
    "brandName" TEXT NOT NULL DEFAULT '',
    "q1_recall" INTEGER,
    "q2_interest" INTEGER,
    "q3_purchase" INTEGER,
    "q4_remember" BOOLEAN,
    "q5_freeform" TEXT NOT NULL DEFAULT '',
    "earnedCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SurveyResponse_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MarketingProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingProfile_userId_key" ON "MarketingProfile"("userId");
