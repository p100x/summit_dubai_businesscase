import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const businessCase = await prisma.businessCase.findUnique({
      where: { id },
    })

    if (!businessCase) {
      return NextResponse.json(
        { error: 'Business case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(businessCase)
  } catch (error) {
    console.error('Failed to fetch business case:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business case' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, modelYaml } = body

    const businessCase = await prisma.businessCase.update({
      where: { id },
      data: {
        name,
        description,
        modelYaml,
      },
    })

    return NextResponse.json(businessCase)
  } catch (error) {
    console.error('Failed to update business case:', error)
    return NextResponse.json(
      { error: 'Failed to update business case' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.businessCase.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete business case:', error)
    return NextResponse.json(
      { error: 'Failed to delete business case' },
      { status: 500 }
    )
  }
}