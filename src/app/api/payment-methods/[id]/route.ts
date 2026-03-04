import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { paymentMethodUpdateSchema } from "@/lib/validations/payment-method"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.paymentMethod.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "결제수단을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = paymentMethodUpdateSchema.parse(body)

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.type !== undefined && { type: validated.type }),
        ...(validated.cardCompany !== undefined && { cardCompany: validated.cardCompany }),
        ...(validated.paymentDay !== undefined && { paymentDay: validated.paymentDay }),
        ...(validated.creditLimit !== undefined && { creditLimit: validated.creditLimit }),
      },
    })

    return NextResponse.json(paymentMethod)
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: error },
        { status: 400 }
      )
    }
    console.error("Failed to update payment method:", error)
    return NextResponse.json(
      { error: "결제수단을 수정하는데 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "결제수단을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (existing._count.transactions > 0) {
      return NextResponse.json(
        { error: "해당 결제수단에 연결된 거래가 있어 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    await prisma.paymentMethod.delete({ where: { id } })

    return NextResponse.json({ message: "결제수단이 삭제되었습니다." })
  } catch (error) {
    console.error("Failed to delete payment method:", error)
    return NextResponse.json(
      { error: "결제수단을 삭제하는데 실패했습니다." },
      { status: 500 }
    )
  }
}
