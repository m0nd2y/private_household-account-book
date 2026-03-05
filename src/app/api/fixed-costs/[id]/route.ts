import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fixedCostUpdateSchema } from "@/lib/validations/fixed-cost"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const result = fixedCostUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다" },
        { status: 400 }
      )
    }

    const fixedCost = await prisma.fixedCost.update({
      where: { id: params.id },
      data: result.data,
    })

    return NextResponse.json(fixedCost)
  } catch (error) {
    console.error("Failed to update fixed cost:", error)
    return NextResponse.json(
      { error: "고정비용 수정에 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.fixedCost.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete fixed cost:", error)
    return NextResponse.json(
      { error: "고정비용 삭제에 실패했습니다" },
      { status: 500 }
    )
  }
}
