import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const item = await prisma.recurringTransaction.update({
      where: { id: params.id },
      data: {
        amount: body.amount,
        type: body.type,
        description: body.description,
        frequency: body.frequency,
        dayOfMonth: body.dayOfMonth || null,
        dayOfWeek: body.dayOfWeek || null,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive,
        categoryId: body.categoryId,
        paymentMethodId: body.paymentMethodId || null,
      },
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Failed to update recurring transaction:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.recurringTransaction.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete recurring transaction:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
