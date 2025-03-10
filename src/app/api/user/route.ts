import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // クッキーからユーザーIDを取得
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        user: null,
        message: 'ユーザーが認証されていません'
      });
    }
    
    // ユーザー情報を取得
    const user = await prisma.uSER_TBL.findUnique({
      where: { userId }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        user: null,
        message: 'ユーザーが見つかりません'
      });
    }
    
    // パスワードなどの機密情報を除外
    const safeUser = {
      userId: user.userId,
      userName: user.userName,
      isAdmin: user.isAdmin,
      lineUserName: user.lineUserName
    };
    
    return NextResponse.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
} 