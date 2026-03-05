import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const now = new Date()
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10)
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // Monthly income from Transaction table
    const incomeAgg = await prisma.transaction.aggregate({
      where: {
        type: "INCOME",
        date: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
    })
    const monthlyIncome = incomeAgg._sum.amount || 0

    // Monthly expense from Transaction table + Fixed cost EXPENSE payments only
    const [expenseAgg, fixedExpenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: startDate, lt: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.fixedCostPayment.aggregate({
        where: {
          year,
          month,
          isPaid: true,
          fixedCost: { costType: "EXPENSE" },
        },
        _sum: { actualAmount: true },
      }),
    ])
    const monthlyExpense = (expenseAgg._sum.amount || 0) + (fixedExpenseAgg._sum.actualAmount || 0)

    // Fixed cost SAVING payments count as allocation
    const fixedSavingAgg = await prisma.fixedCostPayment.aggregate({
      where: {
        year,
        month,
        isPaid: true,
        fixedCost: { costType: "SAVING" },
      },
      _sum: { actualAmount: true },
    })
    const fixedSavingAmount = fixedSavingAgg._sum.actualAmount || 0

    // Monthly allocation: BUY + DEPOSIT type AssetTransactions
    const allocationAgg = await prisma.assetTransaction.aggregate({
      where: {
        type: { in: ["BUY", "DEPOSIT"] },
        date: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
    })
    const monthlyAllocation = (allocationAgg._sum.amount || 0) + fixedSavingAmount

    const allocationRate = monthlyIncome > 0
      ? Math.round((monthlyAllocation / monthlyIncome) * 10000) / 100
      : 0

    // Breakdown by asset type for this month
    const txWithAsset = await prisma.assetTransaction.findMany({
      where: {
        type: { in: ["BUY", "DEPOSIT"] },
        date: { gte: startDate, lt: endDate },
      },
      include: { asset: { select: { type: true } } },
    })

    const byTypeMap: Record<string, { amount: number; count: number }> = {}
    for (const tx of txWithAsset) {
      if (!tx.asset) continue
      const aType = tx.asset.type
      if (!byTypeMap[aType]) {
        byTypeMap[aType] = { amount: 0, count: 0 }
      }
      byTypeMap[aType].amount += tx.amount
      byTypeMap[aType].count += 1
    }

    const byType = Object.entries(byTypeMap).map(([type, data]) => ({
      type,
      amount: data.amount,
      count: data.count,
    }))

    return NextResponse.json({
      monthlyIncome,
      monthlyExpense,
      monthlyAllocation,
      allocationRate,
      byType,
    })
  } catch (error) {
    console.error("Failed to fetch asset summary:", error)
    return NextResponse.json(
      { error: "자산 요약을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}
