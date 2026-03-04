import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transactionUpdateSchema } from "@/lib/validations/transaction"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { tags: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "거래를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = transactionUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { tagNames, paymentMethodId, ...data } = parsed.data

    const updateData: Record<string, unknown> = { ...data }

    if (paymentMethodId !== undefined) {
      updateData.paymentMethodId = paymentMethodId || null
    }

    if (tagNames !== undefined) {
      updateData.tags = {
        set: [],
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        paymentMethod: true,
        tags: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Failed to update transaction:", error)
    return NextResponse.json(
      { error: "거래를 수정하는데 실패했습니다" },
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

    const existing = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "거래를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: "거래가 삭제되었습니다" })
  } catch (error) {
    console.error("Failed to delete transaction:", error)
    return NextResponse.json(
      { error: "거래를 삭제하는데 실패했습니다" },
      { status: 500 }
    )
  }
}
