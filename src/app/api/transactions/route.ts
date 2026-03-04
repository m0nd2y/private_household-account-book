import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transactionCreateSchema } from "@/lib/validations/transaction"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const type = searchParams.get("type")
    const categoryId = searchParams.get("categoryId")
    const paymentMethodId = searchParams.get("paymentMethodId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const keyword = searchParams.get("keyword")
    const minAmount = searchParams.get("minAmount")
    const maxAmount = searchParams.get("maxAmount")

    const where: Prisma.TransactionWhereInput = {}

    if (type && (type === "INCOME" || type === "EXPENSE")) {
      where.type = type
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (paymentMethodId) {
      where.paymentMethodId = paymentMethodId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.date.lte = end
      }
    }

    if (keyword) {
      where.OR = [
        { description: { contains: keyword } },
        { memo: { contains: keyword } },
      ]
    }

    if (minAmount || maxAmount) {
      where.amount = {}
      if (minAmount) {
        where.amount.gte = parseInt(minAmount)
      }
      if (maxAmount) {
        where.amount.lte = parseInt(maxAmount)
      }
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          paymentMethod: true,
          tags: true,
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return NextResponse.json(
      { error: "거래 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = transactionCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { tagNames, paymentMethodId, ...data } = parsed.data

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        paymentMethodId: paymentMethodId || null,
        tags: tagNames?.length
          ? {
              connectOrCreate: tagNames.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        paymentMethod: true,
        tags: true,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Failed to create transaction:", error)
    return NextResponse.json(
      { error: "거래를 생성하는데 실패했습니다" },
      { status: 500 }
    )
  }
}
