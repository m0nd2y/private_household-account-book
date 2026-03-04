import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assetCreateSchema } from "@/lib/validations/asset"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}

    if (type) {
      where.type = type
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true"
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
        snapshots: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: assets })
  } catch (error) {
    console.error("Failed to fetch assets:", error)
    return NextResponse.json(
      { error: "자산 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = assetCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const asset = await prisma.asset.create({
      data: parsed.data,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Failed to create asset:", error)
    return NextResponse.json(
      { error: "자산을 생성하는데 실패했습니다" },
      { status: 500 }
    )
  }
}
