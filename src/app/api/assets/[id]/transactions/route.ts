import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assetTransactionCreateSchema } from "@/lib/validations/asset"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: assetId } = params
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "자산을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const where = { assetId }

    const [data, total] = await Promise.all([
      prisma.assetTransaction.findMany({
        where,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.assetTransaction.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error("Failed to fetch asset transactions:", error)
    return NextResponse.json(
      { error: "자산 거래 내역을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: assetId } = params

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "자산을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = assetTransactionCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, amount, ...rest } = parsed.data

    // Calculate currentValue adjustment based on transaction type
    const addTypes = ["BUY", "DEPOSIT", "INTEREST", "DIVIDEND"]
    const subtractTypes = ["SELL", "WITHDRAW"]
    let valueChange = 0

    if (addTypes.includes(type)) {
      valueChange = amount
    } else if (subtractTypes.includes(type)) {
      valueChange = -amount
    }

    // Create transaction and update asset currentValue in a single prisma transaction
    const [assetTransaction] = await prisma.$transaction([
      prisma.assetTransaction.create({
        data: {
          assetId,
          type,
          amount,
          ...rest,
        },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: {
          currentValue: {
            increment: valueChange,
          },
        },
      }),
    ])

    return NextResponse.json(assetTransaction, { status: 201 })
  } catch (error) {
    console.error("Failed to create asset transaction:", error)
    return NextResponse.json(
      { error: "자산 거래를 생성하는데 실패했습니다" },
      { status: 500 }
    )
  }
}
