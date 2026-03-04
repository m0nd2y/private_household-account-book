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
    const type = searchParams.get("type") || "EXPENSE"

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Group transactions by category
    const grouped = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        type,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    })

    // Get category details
    const categoryIds = grouped.map((g) => g.categoryId)
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })

    const categoryMap = new Map(categories.map((c) => [c.id, c]))
    const grandTotal = grouped.reduce(
      (sum, g) => sum + (g._sum.amount || 0),
      0
    )

    const result = grouped.map((g) => {
      const category = categoryMap.get(g.categoryId)
      const total = g._sum.amount || 0
      return {
        categoryId: g.categoryId,
        categoryName: category?.name || "알 수 없음",
        color: category?.color || "#6B7280",
        icon: category?.icon || null,
        total,
        percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch category statistics:", error)
    return NextResponse.json(
      { error: "카테고리별 통계를 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}
