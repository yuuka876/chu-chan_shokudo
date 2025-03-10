import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // クッキーからLINEユーザーIDを取得
    const cookieStore = cookies();
    const lineUserId = cookieStore.get('line_user_id')?.value;
    
    if (!lineUserId) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }
    
    // リクエストボディからユーザー情報を取得
    const body = await request.json();
    const { userId, userName, isAdmin, lineUserName } = body;
    
    // LINE認証と一致するか確認
    if (userId !== lineUserId) {
      return NextResponse.json(
        { success: false, error: '不正なリクエストです' },
        { status: 403 }
      );
    }
    
    // 既存ユーザーを確認
    const existingUser = await prisma.uSER_TBL.findUnique({
      where: { userId }
    });
    
    let user;
    
    if (existingUser) {
      // 既存ユーザーを更新
      user = await prisma.uSER_TBL.update({
        where: { userId },
        data: {
          userName,
          isAdmin,
          lineUserName
        }
      });
    } else {
      // 新規ユーザーを作成
      user = await prisma.uSER_TBL.create({
        data: {
          userId,
          userName,
          isAdmin,
          lineUserName
        }
      });
    }
    
    // ユーザーIDをクッキーに保存
    const response = NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        userName: user.userName,
        isAdmin: user.isAdmin
      }
    });
    
    response.cookies.set('userId', user.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30日間
    });
    
    return response;
  } catch (error) {
    console.error('ユーザー設定エラー:', error);
    return NextResponse.json(
      { success: false, error: 'ユーザー設定に失敗しました' },
      { status: 500 }
    );
  }
} 