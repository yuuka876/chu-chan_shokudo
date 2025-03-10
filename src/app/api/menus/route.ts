import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';
import { cookies } from 'next/headers';
import { menuService } from '@/lib/services/menu-service';

// GET: メニュー一覧を取得
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const mealType = searchParams.get('type') as 'breakfast' | 'lunch' | 'dinner' | undefined;
    
    // 日付が指定されている場合は、その日付のメニューを取得
    if (date) {
      const menus = await menuService.getMenuItems(
        new Date(date),
        mealType
      );
      return NextResponse.json({ menus });
    } 
    // 日付が指定されていない場合は、全てのメニューを取得
    else {
      const menus = await menuService.getAllMenus();
      return NextResponse.json({ menus });
    }
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
    
    // 認証チェック
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // 管理者権限チェック
    const isAdmin = await checkAdminPermission(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }
    
    const body = await req.json();
    
    // 必須フィールドのバリデーション
    if (!body.name || !body.availability) {
      return NextResponse.json(
        { error: '名前と提供時間帯は必須です' },
        { status: 400 }
      );
    }
    
    // 提供日のバリデーション
    if (!body.provideDate) {
      return NextResponse.json(
        { error: '提供日は必須です' },
        { status: 400 }
      );
    }
    
    // 提供日をDate型に変換
    const provideDate = new Date(body.provideDate);
    
    // メニューの作成
    const newMenu = await menuService.createMenu({
      menuName: body.name,
      provideDate: provideDate
    });
    
    return NextResponse.json(
      { message: 'メニューが作成されました', menu: newMenu },
      { status: 201 }
    );
  } catch (error) {
    console.error('メニュー作成エラー:', error);
    return NextResponse.json(
      { error: 'メニューの作成中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 管理者権限をチェックする関数
async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    // ユーザー情報を取得
    const user = await prisma.uSER_TBL.findUnique({
      where: { userId }
    });
    
    // 管理者フラグをチェック
    return user?.isAdmin === true;
  } catch (error) {
    console.error('管理者権限チェックエラー:', error);
    return false;
  }
}
