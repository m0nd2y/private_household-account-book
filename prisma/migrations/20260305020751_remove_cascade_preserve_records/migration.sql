-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssetSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT,
    "value" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssetSnapshot_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AssetSnapshot" ("assetId", "createdAt", "date", "id", "value") SELECT "assetId", "createdAt", "date", "id", "value" FROM "AssetSnapshot";
DROP TABLE "AssetSnapshot";
ALTER TABLE "new_AssetSnapshot" RENAME TO "AssetSnapshot";
CREATE UNIQUE INDEX "AssetSnapshot_assetId_date_key" ON "AssetSnapshot"("assetId", "date");
CREATE TABLE "new_AssetTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "quantity" REAL,
    "unitPrice" REAL,
    "date" DATETIME NOT NULL,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssetTransaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AssetTransaction" ("amount", "assetId", "createdAt", "date", "id", "memo", "quantity", "type", "unitPrice") SELECT "amount", "assetId", "createdAt", "date", "id", "memo", "quantity", "type", "unitPrice" FROM "AssetTransaction";
DROP TABLE "AssetTransaction";
ALTER TABLE "new_AssetTransaction" RENAME TO "AssetTransaction";
CREATE TABLE "new_FixedCostPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fixedCostId" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "actualAmount" INTEGER,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FixedCostPayment_fixedCostId_fkey" FOREIGN KEY ("fixedCostId") REFERENCES "FixedCost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FixedCostPayment" ("actualAmount", "createdAt", "fixedCostId", "id", "isPaid", "month", "paidAt", "year") SELECT "actualAmount", "createdAt", "fixedCostId", "id", "isPaid", "month", "paidAt", "year" FROM "FixedCostPayment";
DROP TABLE "FixedCostPayment";
ALTER TABLE "new_FixedCostPayment" RENAME TO "FixedCostPayment";
CREATE UNIQUE INDEX "FixedCostPayment_fixedCostId_year_month_key" ON "FixedCostPayment"("fixedCostId", "year", "month");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "memo" TEXT,
    "date" DATETIME NOT NULL,
    "categoryId" TEXT,
    "paymentMethodId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "categoryId", "createdAt", "date", "description", "id", "memo", "paymentMethodId", "type", "updatedAt") SELECT "amount", "categoryId", "createdAt", "date", "description", "id", "memo", "paymentMethodId", "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
