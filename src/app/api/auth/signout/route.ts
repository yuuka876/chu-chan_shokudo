import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // クッキーを取得
    const cookieStore = cookies();
    
    // LINE認証関連のクッキーをすべて削除
    cookieStore.delete('line_user_id');
    cookieStore.delete('line_display_name');
    cookieStore.delete('line_picture_url');
    
    // ユーザーIDクッキーも削除
    cookieStore.delete('userId');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('サインアウトエラー:', error);
    return NextResponse.json(
      { success: false, error: 'サインアウト処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 