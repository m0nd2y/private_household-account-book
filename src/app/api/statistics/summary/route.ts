import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(
      searchParams.get("month") || String(new Date().getMonth() + 1)
    )
    const year = parseInt(
      searchParams.get("year") || String(new Date().getFullYear())
    )

    // Current month date range
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Previous month date range
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevStartDate = new Date(prevYear, prevMonth - 1, 1)
    const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59)

    // Current month totals
    const [currentIncome, currentExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: "INCOME",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ])

    // Previous month totals
    const [previousIncome, previousExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: "INCOME",
          date: { gte: prevStartDate, lte: prevEndDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: prevStartDate, lte: prevEndDate },
        },
        _sum: { amount: true },
      }),
    ])

    const totalIncome = currentIncome._sum.amount || 0
    const totalExpense = currentExpense._sum.amount || 0
    const balance = totalIncome - totalExpense
    const previousMonthIncome = previousIncome._sum.amount || 0
    const previousMonthExpense = previousExpense._sum.amount || 0

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance,
      previousMonthIncome,
      previousMonthExpense,
    })
  } catch (error) {
    console.error("Failed to fetch summary:", error)
    return NextResponse.json(
      { error: "통계 요약을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}
