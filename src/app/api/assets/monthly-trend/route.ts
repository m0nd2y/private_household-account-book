import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get("months") || "6", 10)

    const now = new Date()
    const results = []

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1)

      // Monthly income
      const incomeAgg = await prisma.transaction.aggregate({
        where: {
          type: "INCOME",
          date: { gte: targetDate, lt: nextMonth },
        },
        _sum: { amount: true },
      })

      // Monthly allocation (BUY + DEPOSIT)
      const txWithAsset = await prisma.assetTransaction.findMany({
        where: {
          type: { in: ["BUY", "DEPOSIT"] },
          date: { gte: targetDate, lt: nextMonth },
        },
        include: { asset: { select: { type: true } } },
      })

      let allocation = 0
      const byType: Record<string, number> = {}
      for (const tx of txWithAsset) {
        allocation += tx.amount
        const aType = tx.asset.type
        byType[aType] = (byType[aType] || 0) + tx.amount
      }

      const y = targetDate.getFullYear()
      const m = String(targetDate.getMonth() + 1).padStart(2, "0")

      results.push({
        month: `${y}-${m}`,
        income: incomeAgg._sum.amount || 0,
        allocation,
        byType,
      })
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error("Failed to fetch asset monthly trend:", error)
    return NextResponse.json(
      { error: "월별 추이를 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}
