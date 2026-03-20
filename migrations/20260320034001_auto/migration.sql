-- CreateTable
CREATE TABLE "HousingListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL DEFAULT '',
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" REAL NOT NULL DEFAULT 1,
    "sqft" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "utilitiesIncl" BOOLEAN NOT NULL DEFAULT false,
    "petFriendly" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RestorationProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "proposedUse" TEXT NOT NULL,
    "estimatedCost" REAL NOT NULL,
    "fundingGoal" REAL NOT NULL,
    "amountRaised" REAL NOT NULL DEFAULT 0,
    "backerCount" INTEGER NOT NULL DEFAULT 0,
    "championId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RestorationProject_championId_fkey" FOREIGN KEY ("championId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RestorationUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RestorationUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "RestorationProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LaborPledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LaborPledge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "RestorationProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LaborPledge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
