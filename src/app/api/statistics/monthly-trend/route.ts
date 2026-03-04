import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(
      searchParams.get("year") || String(new Date().getFullYear())
    )

    // Fetch all transactions for the given year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    })

    // Aggregate by month
    const monthlyData: { month: number; income: number; expense: number }[] = []

    for (let m = 1; m <= 12; m++) {
      const monthTransactions = transactions.filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() + 1 === m
      })

      const income = monthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0)

      monthlyData.push({ month: m, income, expense })
    }

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error("Failed to fetch monthly trend:", error)
    return NextResponse.json(
      { error: "월별 추이를 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}
