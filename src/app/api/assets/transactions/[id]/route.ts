import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assetTransactionUpdateSchema } from "@/lib/validations/asset"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.assetTransaction.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "자산 거래를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = assetTransactionUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const assetTransaction = await prisma.assetTransaction.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(assetTransaction)
  } catch (error) {
    console.error("Failed to update asset transaction:", error)
    return NextResponse.json(
      { error: "자산 거래를 수정하는데 실패했습니다" },
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

    const existing = await prisma.assetTransaction.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "자산 거래를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // Reverse the currentValue adjustment before deleting
    const addTypes = ["BUY", "DEPOSIT", "INTEREST", "DIVIDEND"]
    const subtractTypes = ["SELL", "WITHDRAW"]
    let valueChange = 0

    if (addTypes.includes(existing.type)) {
      valueChange = -existing.amount
    } else if (subtractTypes.includes(existing.type)) {
      valueChange = existing.amount
    }

    const ops = [
      prisma.assetTransaction.delete({ where: { id } }),
    ]
    if (existing.assetId) {
      ops.push(
        prisma.asset.update({
          where: { id: existing.assetId },
          data: { currentValue: { increment: valueChange } },
        }) as never
      )
    }
    await prisma.$transaction(ops)

    return NextResponse.json({ message: "자산 거래가 삭제되었습니다" })
  } catch (error) {
    console.error("Failed to delete asset transaction:", error)
    return NextResponse.json(
      { error: "자산 거래를 삭제하는데 실패했습니다" },
      { status: 500 }
    )
  }
}
