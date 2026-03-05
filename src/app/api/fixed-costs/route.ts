import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fixedCostCreateSchema } from "@/lib/validations/fixed-cost"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const fixedCosts = await prisma.fixedCost.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { dueDay: "asc" }, { name: "asc" }],
      include: {
        payments:
          month && year
            ? {
                where: {
                  month: parseInt(month, 10),
                  year: parseInt(year, 10),
                },
              }
            : false,
      },
    })

    const data = fixedCosts.map((fc) => ({
      ...fc,
      payment: Array.isArray(fc.payments) ? fc.payments[0] || null : null,
      payments: undefined,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Failed to fetch fixed costs:", error)
    return NextResponse.json(
      { error: "고정비용을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = fixedCostCreateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const fixedCost = await prisma.fixedCost.create({
      data: result.data,
    })

    return NextResponse.json(fixedCost, { status: 201 })
  } catch (error) {
    console.error("Failed to create fixed cost:", error)
    return NextResponse.json(
      { error: "고정비용 생성에 실패했습니다" },
      { status: 500 }
    )
  }
}
