-- CreateTable
CREATE TABLE "FixedCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "expectedAmount" INTEGER NOT NULL,
    "categoryId" TEXT,
    "dueDay" INTEGER,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FixedCostPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fixedCostId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "actualAmount" INTEGER,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FixedCostPayment_fixedCostId_fkey" FOREIGN KEY ("fixedCostId") REFERENCES "FixedCost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FixedCostPayment_fixedCostId_year_month_key" ON "FixedCostPayment"("fixedCostId", "year", "month");
