import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categoryUpdateSchema } from "@/lib/validations/category"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "카테고리를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = categoryUpdateSchema.parse(body)

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.type !== undefined && { type: validated.type }),
        ...(validated.icon !== undefined && { icon: validated.icon }),
        ...(validated.color !== undefined && { color: validated.color }),
        ...(validated.parentId !== undefined && { parentId: validated.parentId }),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: error },
        { status: 400 }
      )
    }
    console.error("Failed to update category:", error)
    return NextResponse.json(
      { error: "카테고리를 수정하는데 실패했습니다." },
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

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "카테고리를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (existing._count.transactions > 0) {
      return NextResponse.json(
        { error: "해당 카테고리에 연결된 거래가 있어 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    // Delete children first if any
    await prisma.category.deleteMany({
      where: { parentId: id },
    })

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ message: "카테고리가 삭제되었습니다." })
  } catch (error) {
    console.error("Failed to delete category:", error)
    return NextResponse.json(
      { error: "카테고리를 삭제하는데 실패했습니다." },
      { status: 500 }
    )
  }
}
