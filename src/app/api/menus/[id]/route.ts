import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';
import { cookies } from 'next/headers';
import { menuService } from '@/lib/services/menu-service';

// GET: 特定のメニューを取得
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = params.id;
    const menu = await menuService.getMenuById(menuId);
    
    if (!menu) {
      return NextResponse.json(
        { error: 'メニューが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ menu });
  } catch (error) {
    console.error('メニュー取得エラー:', error);
    return NextResponse.json(
      { error: 'メニューの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// PUT: メニューを更新（管理者のみ）
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const menuId = params.id;
    const body = await req.json();
    
    // メニューの存在確認
    const existingMenu = await menuService.getMenuById(menuId);
    if (!existingMenu) {
      return NextResponse.json(
        { error: '更新対象のメニューが見つかりません' },
        { status: 404 }
      );
    }
    
    // 必須フィールドのバリデーション
    if (!body.name) {
      return NextResponse.json(
        { error: 'メニュー名は必須です' },
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
    
    // メニューの更新
    const updatedMenu = await menuService.updateMenu(menuId, {
      menuName: body.name,
      provideDate: provideDate,
      isReserved: body.isReserved
    });
    
    if (!updatedMenu) {
      return NextResponse.json(
        { error: 'メニューの更新に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'メニューが更新されました',
      menu: updatedMenu
    });
  } catch (error) {
    console.error('メニュー更新エラー:', error);
    return NextResponse.json(
      { error: 'メニューの更新中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: メニューを削除（管理者のみ）
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const menuId = params.id;
    
    // メニューの存在確認
    const existingMenu = await menuService.getMenuById(menuId);
    if (!existingMenu) {
      return NextResponse.json(
        { error: '削除対象のメニューが見つかりません' },
        { status: 404 }
      );
    }
    
    // 予約済みのメニューは削除できないようにする
    if (existingMenu.isReserved) {
      return NextResponse.json(
        { error: '予約済みのメニューは削除できません' },
        { status: 400 }
      );
    }
    
    // メニューの削除
    const success = await menuService.deleteMenu(menuId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'メニューの削除に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'メニューが削除されました'
    });
  } catch (error) {
    console.error('メニュー削除エラー:', error);
    return NextResponse.json(
      { error: 'メニューの削除中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
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