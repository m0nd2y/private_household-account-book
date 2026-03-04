import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: { amount: body.amount },
      include: { category: true },
    })
    return NextResponse.json(budget)
  } catch (error) {
    console.error("Failed to update budget:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.budget.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete budget:", error)
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
  }
}
