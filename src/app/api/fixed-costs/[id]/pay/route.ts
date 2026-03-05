import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fixedCostPaymentSchema } from "@/lib/validations/fixed-cost"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get("month") || "", 10)
    const year = parseInt(searchParams.get("year") || "", 10)

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "올바른 월/년을 입력해주세요" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const result = fixedCostPaymentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다" },
        { status: 400 }
      )
    }

    const payment = await prisma.fixedCostPayment.upsert({
      where: {
        fixedCostId_year_month: {
          fixedCostId: params.id,
          year,
          month,
        },
      },
      create: {
        fixedCostId: params.id,
        year,
        month,
        isPaid: true,
        actualAmount: result.data.actualAmount,
        paidAt: new Date(),
      },
      update: {
        isPaid: true,
        actualAmount: result.data.actualAmount,
        paidAt: new Date(),
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Failed to mark payment:", error)
    return NextResponse.json(
      { error: "납부 처리에 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get("month") || "", 10)
    const year = parseInt(searchParams.get("year") || "", 10)

    if (!month || !year) {
      return NextResponse.json(
        { error: "올바른 월/년을 입력해주세요" },
        { status: 400 }
      )
    }

    await prisma.fixedCostPayment.deleteMany({
      where: {
        fixedCostId: params.id,
        year,
        month,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to cancel payment:", error)
    return NextResponse.json(
      { error: "납부 취소에 실패했습니다" },
      { status: 500 }
    )
  }
}
