import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { paymentMethodCreateSchema } from "@/lib/validations/payment-method"

export async function GET() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    })

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error("Failed to fetch payment methods:", error)
    return NextResponse.json(
      { error: "결제수단 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = paymentMethodCreateSchema.parse(body)

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name: validated.name,
        type: validated.type,
        cardCompany: validated.cardCompany || null,
        paymentDay: validated.paymentDay || null,
        creditLimit: validated.creditLimit || null,
        isDefault: false,
      },
    })

    return NextResponse.json(paymentMethod, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: error },
        { status: 400 }
      )
    }
    console.error("Failed to create payment method:", error)
    return NextResponse.json(
      { error: "결제수단을 생성하는데 실패했습니다." },
      { status: 500 }
    )
  }
}
