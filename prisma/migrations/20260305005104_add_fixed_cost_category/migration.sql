/*
  Warnings:

  - You are about to drop the column `categoryId` on the `FixedCost` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FixedCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "expectedAmount" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ETC',
    "dueDay" INTEGER,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FixedCost" ("createdAt", "dueDay", "expectedAmount", "id", "isActive", "memo", "name", "updatedAt") SELECT "createdAt", "dueDay", "expectedAmount", "id", "isActive", "memo", "name", "updatedAt" FROM "FixedCost";
DROP TABLE "FixedCost";
ALTER TABLE "new_FixedCost" RENAME TO "FixedCost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
