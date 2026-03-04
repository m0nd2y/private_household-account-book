import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

    const budgets = await prisma.budget.findMany({
      where: { month, year },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    })

    // 해당 월의 카테고리별 실제 지출도 함께 조회
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const spending = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    const totalExpense = await prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    const budgetsWithSpending = budgets.map((b) => {
      const spent = spending.find((s) => s.categoryId === b.categoryId)
      return {
        ...b,
        spent: spent?._sum.amount || 0,
      }
    })

    return NextResponse.json({
      budgets: budgetsWithSpending,
      totalExpense: totalExpense._sum.amount || 0,
    })
  } catch (error) {
    console.error("Failed to fetch budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, month, year, categoryId } = body

    const budget = await prisma.budget.upsert({
      where: {
        month_year_categoryId: {
          month,
          year,
          categoryId: categoryId || null,
        },
      },
      update: { amount },
      create: {
        amount,
        month,
        year,
        categoryId: categoryId || null,
      },
      include: { category: true },
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Failed to create/update budget:", error)
    return NextResponse.json({ error: "Failed to create/update budget" }, { status: 500 })
  }
}
