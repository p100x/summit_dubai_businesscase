import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try to query the database to check if tables exist
    await prisma.businessCase.count();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database is already initialized' 
    });
  } catch (error: any) {
    if (error.code === 'P2021') {
      // Table doesn't exist
      return NextResponse.json({ 
        status: 'error',
        message: 'Database tables not found. Please run: npx prisma db push',
        error: error.message
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection error',
      error: error.message 
    }, { status: 500 });
  }
}