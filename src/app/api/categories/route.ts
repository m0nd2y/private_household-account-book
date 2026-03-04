import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categoryCreateSchema } from "@/lib/validations/category"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where = type ? { type } : {}

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: true,
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json(
      { error: "카테고리 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = categoryCreateSchema.parse(body)

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        type: validated.type,
        icon: validated.icon || null,
        color: validated.color || null,
        parentId: validated.parentId || null,
        isDefault: false,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: error },
        { status: 400 }
      )
    }
    console.error("Failed to create category:", error)
    return NextResponse.json(
      { error: "카테고리를 생성하는데 실패했습니다." },
      { status: 500 }
    )
  }
}
