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

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Group expense transactions by payment method
    const grouped = await prisma.transaction.groupBy({
      by: ["paymentMethodId"],
      where: {
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
        paymentMethodId: { not: null },
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    })

    // Get payment method details
    const paymentMethodIds = grouped
      .map((g) => g.paymentMethodId)
      .filter((id): id is string => id !== null)

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { id: { in: paymentMethodIds } },
    })

    const pmMap = new Map(paymentMethods.map((pm) => [pm.id, pm]))

    const result = grouped.map((g) => {
      const pm = g.paymentMethodId ? pmMap.get(g.paymentMethodId) : null
      return {
        paymentMethodId: g.paymentMethodId,
        name: pm?.name || "기타",
        type: pm?.type || null,
        total: g._sum.amount || 0,
        count: g._count.id,
      }
    })

    // Also include transactions without payment method
    const noPaymentMethod = await prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
        paymentMethodId: null,
      },
      _sum: { amount: true },
      _count: { id: true },
    })

    if (noPaymentMethod._count.id > 0) {
      result.push({
        paymentMethodId: null,
        name: "미지정",
        type: null,
        total: noPaymentMethod._sum.amount || 0,
        count: noPaymentMethod._count.id,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch payment method statistics:", error)
    return NextResponse.json(
      { error: "결제수단별 통계를 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}
