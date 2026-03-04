import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assetUpdateSchema } from "@/lib/validations/asset"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 10,
        },
        snapshots: {
          orderBy: { date: "desc" },
          take: 1,
        },
        _count: {
          select: { transactions: true, snapshots: true },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "자산을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Failed to fetch asset:", error)
    return NextResponse.json(
      { error: "자산을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "자산을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = assetUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Failed to update asset:", error)
    return NextResponse.json(
      { error: "자산을 수정하는데 실패했습니다" },
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

    const existing = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "자산을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ message: "자산이 삭제되었습니다" })
  } catch (error) {
    console.error("Failed to delete asset:", error)
    return NextResponse.json(
      { error: "자산을 삭제하는데 실패했습니다" },
      { status: 500 }
    )
  }
}
