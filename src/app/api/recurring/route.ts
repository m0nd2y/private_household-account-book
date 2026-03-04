import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const items = await prisma.recurringTransaction.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch recurring transactions:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await prisma.recurringTransaction.create({
      data: {
        amount: body.amount,
        type: body.type,
        description: body.description,
        frequency: body.frequency,
        dayOfMonth: body.dayOfMonth || null,
        dayOfWeek: body.dayOfWeek || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        categoryId: body.categoryId,
        paymentMethodId: body.paymentMethodId || null,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Failed to create recurring transaction:", error)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
