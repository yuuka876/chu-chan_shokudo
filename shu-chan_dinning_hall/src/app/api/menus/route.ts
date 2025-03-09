import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { menuService } from '@/lib/services/menu-service';

// GET: メニュー一覧を取得
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const mealType = searchParams.get('type') as 'breakfast' | 'lunch' | 'dinner' | undefined;
    
    const menus = menuService.getMenuItems(
      date ? new Date(date) : new Date(),
      mealType
    );
    
    return NextResponse.json({ menus });
  } catch (error) {
    console.error('メニュー取得エラー:', error);
    return NextResponse.json(
      { error: 'メニューの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいメニューを作成（管理者のみ）
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // 管理者かどうかのチェック（実際のアプリでは管理者チェックのロジックが必要）
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // TODO: 実際のアプリでは、ここで管理者権限をチェックする
    // if (!isAdmin(userId)) {
    //   return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    // }
    
    const body = await req.json();
    
    // 注意: 現在のmenuServiceにはメニュー作成メソッドがない
    // 実際のアプリでは、メニュー作成用のメソッドを追加する必要がある
    
    return NextResponse.json(
      { message: '機能実装中です。後日ご利用ください。' },
      { status: 501 }
    );
  } catch (error) {
    console.error('メニュー作成エラー:', error);
    return NextResponse.json(
      { error: 'メニューの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
