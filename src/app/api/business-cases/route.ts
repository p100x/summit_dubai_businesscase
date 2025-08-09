import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const businessCases = await prisma.businessCase.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json(businessCases)
  } catch (error) {
    console.error('Failed to fetch business cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business cases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, modelYaml } = body

    if (!name || !modelYaml) {
      return NextResponse.json(
        { error: 'Name and model YAML are required' },
        { status: 400 }
      )
    }

    const businessCase = await prisma.businessCase.create({
      data: {
        name,
        description,
        modelYaml,
      },
    })

    return NextResponse.json(businessCase, { status: 201 })
  } catch (error) {
    console.error('Failed to create business case:', error)
    return NextResponse.json(
      { error: 'Failed to create business case' },
      { status: 500 }
    )
  }
}