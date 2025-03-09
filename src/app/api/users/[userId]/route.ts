import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 特定のユーザーを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    const user = await prisma.uSER_TBL.findUnique({
      where: {
        userId: userId
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('API error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// ユーザーを更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const updates = await request.json();
    
    const user = await prisma.uSER_TBL.update({
      where: {
        userId: userId
      },
      data: updates
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('API error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// ユーザーを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    await prisma.uSER_TBL.delete({
      where: {
        userId: userId
      }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 