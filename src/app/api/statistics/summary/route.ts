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
    const [currentIncome, currentExpense, currentDiscount] = await Promise.all([
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
      prisma.transaction.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
          discountAmount: { gt: 0 },
        },
        _sum: { discountAmount: true },
      }),
    ])

    const totalDiscount = currentDiscount._sum.discountAmount || 0

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

    const transactionIncome = currentIncome._sum.amount || 0
    const transactionExpense = currentExpense._sum.amount || 0
    const previousMonthIncome = previousIncome._sum.amount || 0
    const previousMonthExpense = previousExpense._sum.amount || 0

    // Fixed costs summary (with costType awareness)
    const activeFixedCosts = await prisma.fixedCost.findMany({
      where: { isActive: true },
    })
    const fixedCostPayments = await prisma.fixedCostPayment.findMany({
      where: { year, month, isPaid: true },
      include: { fixedCost: { select: { costType: true } } },
    })

    const fixedCostsTotal = activeFixedCosts.length
    const fixedCostsPaid = fixedCostPayments.length
    const fixedCostsExpectedTotal = activeFixedCosts.reduce(
      (sum, fc) => sum + fc.expectedAmount,
      0
    )
    const fixedCostsPaidTotal = fixedCostPayments.reduce(
      (sum, p) => sum + (p.actualAmount || 0),
      0
    )
    const fixedCostsUnpaidNames = activeFixedCosts
      .filter(
        (fc) => !fixedCostPayments.some((p) => p.fixedCostId === fc.id)
      )
      .map((fc) => fc.name)

    // Split by costType: EXPENSE vs SAVING
    const fixedExpensePayments = fixedCostPayments.filter(
      (p) => p.fixedCost?.costType === "EXPENSE"
    )
    const fixedSavingPayments = fixedCostPayments.filter(
      (p) => p.fixedCost?.costType === "SAVING"
    )
    const fixedExpenseTotal = fixedExpensePayments.reduce(
      (sum, p) => sum + (p.actualAmount || 0),
      0
    )
    const fixedSavingTotal = fixedSavingPayments.reduce(
      (sum, p) => sum + (p.actualAmount || 0),
      0
    )

    // Previous month fixed cost payments (expense only)
    const prevFixedCostPayments = await prisma.fixedCostPayment.findMany({
      where: { year: prevYear, month: prevMonth, isPaid: true },
      include: { fixedCost: { select: { costType: true } } },
    })
    const prevFixedExpenseTotal = prevFixedCostPayments
      .filter((p) => p.fixedCost?.costType === "EXPENSE")
      .reduce((sum, p) => sum + (p.actualAmount || 0), 0)

    // Combined totals: only EXPENSE type fixed costs count as expense
    const totalIncome = transactionIncome
    const totalExpense = transactionExpense + fixedExpenseTotal
    const balance = totalIncome - totalExpense

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance,
      totalDiscount,
      transactionExpense,
      fixedCostExpense: fixedExpenseTotal,
      fixedCostSaving: fixedSavingTotal,
      previousMonthIncome,
      previousMonthExpense: previousMonthExpense + prevFixedExpenseTotal,
      fixedCosts: {
        total: fixedCostsTotal,
        paid: fixedCostsPaid,
        expectedTotal: fixedCostsExpectedTotal,
        paidTotal: fixedCostsPaidTotal,
        unpaidNames: fixedCostsUnpaidNames,
      },
    })
  } catch (error) {
    console.error("Failed to fetch summary:", error)
    return NextResponse.json(
      { error: "통계 요약을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}
