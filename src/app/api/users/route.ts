import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ユーザー一覧を取得するAPI
export async function GET() {
  try {
    console.log('API: Fetching all users from Prisma...');
    
    const users = await prisma.uSER_TBL.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`API: Found ${users.length} users`);
    return NextResponse.json(users);
  } catch (error) {
    console.error('API error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// ユーザーを作成するAPI
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // 必須フィールドの検証
    if (!userData.userName) {
      return NextResponse.json(
        { error: 'userName is required' },
        { status: 400 }
      );
    }
    
    // ユーザーを作成
    const newUser = await prisma.uSER_TBL.create({
      data: {
        userName: userData.userName,
        isAdmin: userData.isAdmin || false,
        lineUserName: userData.lineUserName || null
      }
    });
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('API error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 